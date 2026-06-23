# Design

## V1-4 Report Center

The `/reports` page is a product-manager reporting workbench:

- Configuration panel: report title, type, time range, product, module, impact, provider, action, and note.
- Signal selector: a wide, scrollable formal-signal table with checkbox selection, current-filter select all, and clear selection.
- Charts: four linked charts for module distribution, source channel distribution, signal type distribution, and impact level distribution.
- Summary tables: high-impact signals, competitor/user voice summary, and key opportunities.
- Markdown preview: generate, copy, download `.md`, and clear current report.

All report visuals and text are based only on the currently selected formal signals. Empty states explain whether the user needs to approve signals first or select records for the current report.

The report center intentionally avoids AI poster generation, PDF/Word export, and DeepSeek report writing in V1-4.

## V1-3 Review Flow

The `/review` page remains a product-manager workbench:

- Statistics cards summarize pending, review, approved, and ignored counts.
- The pending-material area includes an analysis provider selector: Mock AI or DeepSeek.
- Mock AI is labelled as local flow validation.
- DeepSeek is labelled as a real model call that may incur cost and requires a configured API key.
- Pending review cards show provider, model name, prompt version, confidence, module, type, impact, conclusion, evidence, insight, and action.

## Human Review Principles

- Approve when the model result is good enough to become a product signal.
- Modify when the module, type, impact, conclusion, evidence, insight, action, or confidence needs adjustment.
- Ignore when the raw material is invalid, too vague, or not useful for product decisions.

## Signal Table

The `/signals` page is the formal signal table. It displays only human-confirmed results and keeps provider details in the detail dialog to avoid overcrowding the table.
