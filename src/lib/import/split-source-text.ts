import type { SplitItem, SplitResult } from '@/types/import';

const SHORT_CONTENT_LIMIT = 8;

function createSplitId(index: number): string {
  return `split-${index + 1}-${Date.now().toString(36)}`;
}

function normalizeInput(input: string): string {
  return input.trim().replace(/\r\n?/g, '\n');
}

function hasDividerLine(input: string): boolean {
  return /^---$/m.test(input);
}

function splitByNumbering(input: string): string[] {
  const normalized = input.replace(
    /(?:^|\n)\s*(?:\d+[.\u3001]|[\uFF08(]\d+[\uFF09)])\s*/g,
    (match, offset) => (offset === 0 ? '' : '\n@@SOURCE_ITEM@@')
  );

  return normalized.split('\n@@SOURCE_ITEM@@');
}

function collectDuplicateWarnings(items: SplitItem[]): void {
  const seen = new Map<string, number[]>();

  items.forEach((item, index) => {
    const normalized = item.content.trim();
    const existing = seen.get(normalized) ?? [];
    existing.push(index);
    seen.set(normalized, existing);
  });

  seen.forEach((indexes) => {
    if (indexes.length <= 1) return;

    indexes.forEach((index) => {
      items[index].warnings.push('检测到完全重复资料');
    });
  });
}

export function splitSourceText(input: string): SplitResult {
  const normalized = normalizeInput(input);

  if (!normalized) {
    return {
      items: [],
      count: 0,
      warnings: ['内容不能为空']
    };
  }

  let parts: string[] = [];
  const globalWarnings: string[] = [];

  if (hasDividerLine(normalized)) {
    parts = normalized.split(/^---$/m);
  } else {
    parts = normalized.split(/\n\s*\n+/);

    if (parts.length <= 1) {
      parts = splitByNumbering(normalized);

      if (parts.length <= 1) {
        globalWarnings.push('未检测到明确分隔符');
      }
    }
  }

  const items = parts
    .map((part) => part.trim())
    .filter(Boolean)
    .map<SplitItem>((content, index) => ({
      id: createSplitId(index),
      content,
      characterCount: content.length,
      warnings: content.length < SHORT_CONTENT_LIMIT ? ['内容长度过短'] : []
    }));

  collectDuplicateWarnings(items);

  const itemWarnings = items.flatMap((item) => item.warnings);
  const warnings = Array.from(new Set([...globalWarnings, ...itemWarnings]));

  return {
    items,
    count: items.length,
    warnings
  };
}
