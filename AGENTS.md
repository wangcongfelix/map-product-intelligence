# AGENTS.md

## Project

Map Product Intelligence is a Next.js workspace for importing map product materials, reviewing AI-assisted product signals, maintaining a confirmed signal table, and preparing reports.

## Current Stage

Stage 0 has only established the cleaned shell and four empty pages:

- `/import`
- `/review`
- `/signals`
- `/reports`

Do not claim that AI analysis, report generation, or evaluation is implemented until those features exist.

## Boundaries

- Do not copy Project001 business code, prompts, data structures, or pages.
- Do not add real API keys to the repository.
- Do not read or print `.env.local` secrets.
- Do not connect DeepSeek before the V1 integration stage is explicitly requested.
- Use npm as the package manager.
- Do not commit or push unless explicitly requested.

## Development Notes

- Keep business code out of `src/components/ui/`.
- Put shared business services in `src/services/`.
- Put shared client stores in `src/stores/`.
- Put shared domain types in `src/types/`.
- Keep prompts in `prompts/` and prompt documentation in `docs/PROMPT_V1.md`.
