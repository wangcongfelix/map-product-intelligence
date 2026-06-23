# Prompt V1

V1-3 introduces the first production prompt contract for DeepSeek.

## Role

The model acts as a user-voice analysis assistant for map, mobility, and outdoor product managers.

## Input

Each request includes:

- product type
- product name
- source channel
- raw content

## Output

The model must output JSON only, matching `SignalAnalysis`:

- `module`
- `signalType`
- `coreConclusion`
- `userScenario`
- `impactLevel`
- `evidenceQuote`
- `productInsight`
- `recommendedAction`
- `confidence`

All enum fields must use project-defined values. `evidenceQuote` must come from the original raw text. `confidence` must be a number between 0 and 1.

## Constraints

- No Markdown.
- No code fences.
- No explanation outside JSON.
- No invented information.
- Low-confidence records still need a preferred judgment.
- Do not output “待人工判断”.
- Pure emotion or content without product information should map to `其他 / 无有效信息 / 无效 / 暂不处理`.

## Runtime

Prompt construction lives in `src/services/analysis/analysis-prompt-v1.ts`. Schema validation lives in `src/services/analysis/analysis-schema.ts`.
