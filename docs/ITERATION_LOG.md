# Iteration Log

## Stage 0

- Cleaned the open source dashboard base.
- Removed unrelated demo business, authentication, engineering integrations, and base-specific AI coding configuration.
- Established the workspace shell and four page routes.

## V1-1

- Added product and source selection for import.
- Added single and batch text input.
- Added deterministic batch splitting with preview.
- Added preview edit and delete.
- Added confirm import flow.
- Added local raw material persistence.
- Added `/review` pending analysis list.
- Added split regression tests via `npm run test:split`.

## V1-2

- Added Mock AI analysis types.
- Added local keyword-based Mock analyzer.
- Extended the client store with `analysisRecords`.
- Added `/review` statistics, pending analysis list, pending review cards, approve, modify, and ignore actions.
- Added `/signals` table for human-confirmed signals.
- Added Mock analysis regression tests via `npm run test:mock-analysis`.

## V1-3

- Added server-side DeepSeek API route.
- Added Prompt V1 builder.
- Added Zod schema validation and Markdown JSON fence cleanup.
- Preserved Mock AI as fallback and regression path.
- Added provider selection on `/review`.
- Added provider/model/prompt metadata to analysis records and signal details.
- Added schema regression tests via `npm run test:analysis-schema`.

Not included:

- Report generation.
- Evaluation dashboard.
- Real data ingestion beyond text import.

## V1-4

- Added `/reports` report center for confirmed product signals.
- Added report configuration, formal-signal filtering, checkbox selection, select-current-filter, and clear selection.
- Added four chart views based on selected records: module, source channel, signal type, and impact level.
- Added three summary tables: high-impact signals, competitor/user voice summary, and key opportunities.
- Added deterministic Markdown report generation with scope, findings, module table, high-impact table, product summaries, action groups, and evidence index.
- Added copy Markdown and download `.md` actions.
- Persisted report drafts and current report selection in the existing LocalStorage store.
- Added report generator and metrics regression tests.
- Refined the workspace UI and added chart PNG export.

Not included:

- DeepSeek report generation.
- PDF or Word export.
- AI poster/image generation.
