export type ProductGroup = 'general_map' | 'outdoor_map' | 'custom';

export type CustomProductCategory = 'general_map' | 'outdoor_map' | 'other_mobility';

export type SourceChannel =
  | 'app_store_review'
  | 'community_comment'
  | 'release_notes'
  | 'official_announcement'
  | 'competitor_observation'
  | 'other';

export type ImportMode = 'single' | 'batch';

export type RawSignalStatus =
  | 'pending_analysis'
  | 'processing'
  | 'analysis_failed'
  | 'pending_review'
  | 'approved'
  | 'ignored';

export interface RawSignal {
  id: string;
  batchId: string;
  productGroup: ProductGroup;
  productName: string;
  sourceChannel: SourceChannel;
  customSourceName?: string;
  rawContent: string;
  status: RawSignalStatus;
  isSynthetic: boolean;
  importedAt: string;
}

export interface ImportBatch {
  id: string;
  productGroup: ProductGroup;
  productName: string;
  sourceChannel: SourceChannel;
  customSourceName?: string;
  importMode: ImportMode;
  rawInput: string;
  itemCount: number;
  createdAt: string;
}

export interface ImportDraft {
  productGroup: ProductGroup | '';
  productName: string;
  customProductName: string;
  customProductCategory: CustomProductCategory;
  sourceChannel: SourceChannel | '';
  customSourceName: string;
  importMode: ImportMode;
  rawInput: string;
  isSynthetic: boolean;
}

export interface SplitItem {
  id: string;
  content: string;
  characterCount: number;
  warnings: string[];
}

export interface SplitResult {
  items: SplitItem[];
  count: number;
  warnings: string[];
}
