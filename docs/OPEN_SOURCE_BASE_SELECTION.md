# Open Source Base Selection

## Why Not Start From Empty

Starting from an empty Next.js project would require rebuilding the admin shell, theme system, shadcn/ui wiring, table utilities, form primitives, and basic application layout before any product work could begin. The selected base already provides these generic foundations, so Stage 0 can focus on removing unrelated demo business and establishing the correct project shape.

## Base Technology Stack

- Next.js 16 App Router
- React 19
- TypeScript 5.7
- Tailwind CSS v4
- shadcn/ui
- TanStack Query
- TanStack Table
- TanStack Form
- Zod

## License

The base project is distributed under the MIT License.

## Retained Content

- Application shell with sidebar and header patterns
- UI component library and theme infrastructure
- Query, table, form, upload, chart, and utility foundations
- Next.js, TypeScript, ESLint/Oxlint, and formatting setup

## Removed Content

- Original dashboard demo routes and feature modules
- Clerk authentication, organizations, billing, profile, and RBAC
- Sentry integration
- Docker files
- Husky hooks
- KBar command palette
- GitHub sponsorship, stars, and template promotion
- Base-specific AI coding configuration
- Bun lock workflow

## New Content

- Route group based workspace shell
- `/import`, `/review`, `/signals`, and `/reports` page shells
- Project documentation skeleton
- Third-party notices
- npm lockfile workflow

## Open Source Boundary And Personal Contribution

Open source base capabilities provide the generic web application foundation. Personal contribution begins with the product definition, workspace information architecture, route structure, cleaned dependency surface, and future V1 business workflows for map product intelligence. No Project001 business code, prompts, data structures, or pages are copied into this project.

## Known Version Risks

- Next.js 16 and React 19 are modern versions and may expose compatibility issues in third-party packages.
- Tailwind CSS v4 changes configuration and CSS patterns compared with v3.
- Some retained UI primitives are not yet used by Stage 0 pages but are intentionally kept for V1 form, table, and reporting work.
- Build currently depends on Google Fonts through `next/font`, so offline builds may fail unless fonts are cached or localized later.
