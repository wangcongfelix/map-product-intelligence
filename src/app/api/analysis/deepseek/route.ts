import { NextResponse } from 'next/server';
import { ANALYSIS_PROMPT_VERSION, deepseekAnalyzeSignal } from '@/services/analysis/deepseek-analyze-signal';
import type { DeepSeekBatchResponse } from '@/services/analysis/analyze-signal';
import type { RawSignal } from '@/types/import';

export const runtime = 'nodejs';

function isRawSignalList(input: unknown): input is RawSignal[] {
  return Array.isArray(input) && input.every((item) => typeof item === 'object' && item !== null);
}

function safeErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.includes('status')) {
    return error.message;
  }

  return 'DeepSeek 分析失败，请稍后重试。';
}

export async function POST(request: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const baseUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
  const modelName = process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash';

  if (!apiKey) {
    return NextResponse.json<DeepSeekBatchResponse>(
      {
        ok: false,
        message: '未配置 DeepSeek API Key。请在 .env.local 中设置 DEEPSEEK_API_KEY 后重启开发服务。'
      },
      { status: 400 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json<DeepSeekBatchResponse>(
      {
        ok: false,
        message: '请求体不是有效 JSON。'
      },
      { status: 400 }
    );
  }

  const rawSignals = (body as { rawSignals?: unknown }).rawSignals;

  if (!isRawSignalList(rawSignals)) {
    return NextResponse.json<DeepSeekBatchResponse>(
      {
        ok: false,
        message: '请求体缺少 rawSignals。'
      },
      { status: 400 }
    );
  }

  const records: NonNullable<DeepSeekBatchResponse['records']> = [];
  const errors: NonNullable<DeepSeekBatchResponse['errors']> = [];

  for (const rawSignal of rawSignals) {
    try {
      const result = await deepseekAnalyzeSignal(rawSignal, {
        apiKey,
        baseUrl,
        modelName
      });

      records.push({
        rawSignalId: rawSignal.id,
        analysis: result.analysis,
        provider: 'deepseek',
        modelName,
        promptVersion: ANALYSIS_PROMPT_VERSION,
        latencyMs: result.latencyMs
      });
    } catch (error) {
      errors.push({
        rawSignalId: rawSignal.id,
        message: safeErrorMessage(error)
      });
    }
  }

  return NextResponse.json<DeepSeekBatchResponse>({
    ok: true,
    records,
    errors
  });
}
