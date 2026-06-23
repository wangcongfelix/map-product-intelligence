import { z } from 'zod';
import {
  IMPACT_LEVEL_OPTIONS,
  PRODUCT_MODULE_OPTIONS,
  RECOMMENDED_ACTION_OPTIONS,
  SIGNAL_TYPE_OPTIONS
} from '@/types/analysis';
import type { SignalAnalysis } from '@/types/analysis';

const signalAnalysisSchema = z
  .object({
    module: z.enum(PRODUCT_MODULE_OPTIONS),
    signalType: z.enum(SIGNAL_TYPE_OPTIONS),
    coreConclusion: z.string().trim().min(1),
    userScenario: z.string().trim().min(1),
    impactLevel: z.enum(IMPACT_LEVEL_OPTIONS),
    evidenceQuote: z.string().trim().min(1),
    productInsight: z.string().trim().min(1),
    recommendedAction: z.enum(RECOMMENDED_ACTION_OPTIONS),
    confidence: z.number().min(0).max(1)
  })
  .strip();

export function stripMarkdownJsonFence(rawText: string): string {
  const trimmed = rawText.trim();
  return trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

export function parseSignalAnalysisJson(rawText: string): SignalAnalysis {
  const cleaned = stripMarkdownJsonFence(rawText);
  const parsed = JSON.parse(cleaned) as unknown;
  return signalAnalysisSchema.parse(parsed);
}

export function validateSignalAnalysis(input: unknown): SignalAnalysis {
  return signalAnalysisSchema.parse(input);
}

export function isSignalAnalysis(input: unknown): input is SignalAnalysis {
  return signalAnalysisSchema.safeParse(input).success;
}
