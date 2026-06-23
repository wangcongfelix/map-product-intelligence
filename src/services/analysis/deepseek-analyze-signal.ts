import {
  ANALYSIS_PROMPT_VERSION,
  ANALYSIS_SYSTEM_PROMPT,
  buildAnalysisUserPrompt
} from '@/services/analysis/analysis-prompt-v1';
import { parseSignalAnalysisJson } from '@/services/analysis/analysis-schema';
import type { SignalAnalysis } from '@/types/analysis';
import type { RawSignal } from '@/types/import';

interface DeepSeekAnalyzeOptions {
  apiKey: string;
  baseUrl: string;
  modelName: string;
}

interface DeepSeekAnalyzeResult {
  analysis: SignalAnalysis;
  latencyMs: number;
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

function endpointFromBaseUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, '')}/chat/completions`;
}

export async function deepseekAnalyzeSignal(
  rawSignal: RawSignal,
  options: DeepSeekAnalyzeOptions
): Promise<DeepSeekAnalyzeResult> {
  const startedAt = Date.now();
  const response = await fetch(endpointFromBaseUrl(options.baseUrl), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: options.modelName,
      messages: [
        {
          role: 'system',
          content: ANALYSIS_SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: buildAnalysisUserPrompt(rawSignal)
        }
      ],
      response_format: {
        type: 'json_object'
      },
      temperature: 0.2
    })
  });

  if (!response.ok) {
    throw new Error(`DeepSeek request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as ChatCompletionResponse;
  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('DeepSeek returned an empty analysis result.');
  }

  return {
    analysis: parseSignalAnalysisJson(content),
    latencyMs: Date.now() - startedAt
  };
}

export { ANALYSIS_PROMPT_VERSION };
