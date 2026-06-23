# Architecture

## Routing

- `/` redirects to `/import`.
- `(workspace)` is a route group and does not appear in the URL.
- `(workspace)/layout.tsx` owns the sidebar, header, and workspace shell.
- `/import`, `/review`, `/signals`, and `/reports` share the workspace shell.

## V1-4 Modules

- `src/types/report.ts` defines report types, filters, approved report records, generated reports, and metrics/table row shapes.
- `src/services/reports/generate-report-metrics.ts` computes distributions and summary table rows from selected approved records.
- `src/services/reports/generate-report.ts` builds deterministic Markdown reports from selected approved records.
- `src/components/reports/` contains the `/reports` workspace, configuration panel, signal selector, chart area, chart PNG export, and Markdown preview.
- `src/app/(workspace)/reports/page.tsx` mounts the report workspace.

## V1-3 Modules

- `src/types/import.ts` defines import drafts, batches, raw signals, source channels, and split results.
- `src/types/analysis.ts` defines analysis records, providers, prompt versions, product modules, signal types, impact levels, and recommended actions.
- `src/services/analysis/mock-analyze-signal.ts` provides local Mock AI rules.
- `src/services/analysis/analysis-prompt-v1.ts` builds the DeepSeek prompt.
- `src/services/analysis/analysis-schema.ts` validates and sanitizes model output.
- `src/services/analysis/deepseek-analyze-signal.ts` calls the OpenAI-compatible DeepSeek chat completions API.
- `src/app/api/analysis/deepseek/route.ts` is the server-only API route that protects the API key.
- `src/stores/import-store.ts` persists local review state to LocalStorage and calls the DeepSeek API route from the client.

## Persistence

V1-3 still uses browser LocalStorage only:

```text
map-product-intelligence-import-store
```

Persisted objects:

- `importBatches`
- `rawSignals`
- `analysisRecords`
- `currentDraft`
- `reportDrafts`
- `currentReportDraft`
- `currentReportSelection`

## State Contract

- Mock success creates `AnalysisRecord` with `provider=mock`, `isMock=true`, `promptVersion=mock-v1`.
- DeepSeek success creates `AnalysisRecord` with `provider=deepseek`, `isMock=false`, `modelName`, and `promptVersion=v1`.
- DeepSeek partial failure marks failed raw records as `analysis_failed`; they remain visible for retry.
- Approve stores `reviewedAnalysis = aiAnalysis`.
- Modify stores the edited result as `reviewedAnalysis` and records `modifiedFields`.
- Ignore sets both review and raw signal status to ignored.
- Report center records are derived by joining approved or modified `AnalysisRecord.reviewedAnalysis` with the matching raw signal metadata.
- Report metrics, chart exports, and Markdown reports are generated only from the current report selection.
- Report drafts persist in LocalStorage so the Markdown preview survives refresh.

## Security Boundary

Client components never read `DEEPSEEK_API_KEY`. The API route reads it on the server and never returns it to the browser.

V1-4 report generation is deterministic and local. It does not call DeepSeek and does not store API keys.
