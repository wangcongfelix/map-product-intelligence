# PRD

## V1-4 Scope

V1-4 adds the `/reports` report center on top of the existing import, review, and signal table flow.

Implemented report flow:

- Read formal product signals from records that already have human-confirmed `reviewedAnalysis`.
- Filter by product, module, impact level, recommended action, analysis provider, and time range.
- Select the exact records used for the report.
- Generate module, source channel, signal type, and impact level charts from the selected records.
- Export the chart dashboard as a PNG image.
- Generate high-impact, user voice/competitor summary, and opportunity tables from the selected records.
- Generate a deterministic Markdown report with scope, findings, module table, high-impact table, product summaries, action groups, and evidence index.
- Copy Markdown to clipboard and download it as `.md`.

## V1-3 Scope

V1-3 connects the existing review loop to real DeepSeek analysis while preserving Mock AI.

Implemented product flow:

- Import raw map product materials.
- Open `/review`.
- Choose Mock AI or DeepSeek.
- Analyze all pending raw records.
- Validate returned `SignalAnalysis` with schema rules.
- Move successful records to pending review.
- Approve, modify and approve, or ignore each result.
- Show only human-confirmed `reviewedAnalysis` records in `/signals`.

## Data Boundary

- `aiAnalysis` is the model or Mock initial judgment.
- `reviewedAnalysis` is the human-confirmed formal signal.
- `/signals` must only read `reviewedAnalysis`.
- `/reports` must only read and generate outputs from selected `reviewedAnalysis` records.
- Ignored records do not enter the signal table.

## DeepSeek Boundary

- DeepSeek is called only through a Next.js server API route.
- `DEEPSEEK_API_KEY` is never read by client components.
- Missing Key returns a clear error message and does not crash the page.
- Automatic tests do not call DeepSeek.
- V1-4 report generation does not call DeepSeek; it uses deterministic local rules.

## Out of Scope

- AI-generated reports.
- PDF and Word export.
- Evaluation metrics and badcase dashboard.
- Excel import, screenshot recognition, crawler, or automatic collection.
- Database, login, permissions, or multi-agent workflows.

## V1-5 Direction

V1-5 can consider AI-assisted report generation, PDF/Word output, evaluation enhancement, or badcase loops after V1-4 is manually verified.
