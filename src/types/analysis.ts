export type ProductModule =
  | '地图浏览与图层'
  | '轨迹记录'
  | '轨迹详情与复盘'
  | '离线地图'
  | '标记点与现场记录'
  | '路线规划与导航'
  | '文件导入导出'
  | '用户记录与资产管理'
  | '分享与跨端流转'
  | '社区与内容'
  | '搜索与地点数据'
  | '性能与稳定性'
  | '设备与权限'
  | '账号、收费与广告'
  | '其他';

export type SignalType =
  | '功能故障'
  | '稳定性问题'
  | '操作体验问题'
  | '入口难找'
  | '功能缺失'
  | '功能建议'
  | '数据错误'
  | '性能与耗电'
  | '权限与兼容问题'
  | '收费与广告问题'
  | '正向体验'
  | '无有效信息'
  | '新增功能'
  | '流程优化'
  | '交互改版'
  | '数据能力增强'
  | '性能与稳定性优化'
  | '社区与内容更新'
  | '收费或商业化调整'
  | '功能下线'
  | '常规修复'
  | '无实质变化';

export type ImpactLevel = '高' | '中' | '低' | '无效';

export type RecommendedAction = '保留' | '补充' | '继续观察' | '暂不处理';

export type ReviewStatus = 'pending_review' | 'approved' | 'modified' | 'ignored';

export type PromptVersion = 'mock-v1' | 'v1';

export type AnalysisProvider = 'mock' | 'deepseek';

export interface SignalAnalysis {
  module: ProductModule;
  signalType: SignalType;
  coreConclusion: string;
  userScenario: string;
  impactLevel: ImpactLevel;
  evidenceQuote: string;
  productInsight: string;
  recommendedAction: RecommendedAction;
  confidence: number;
}

export interface AnalysisRecord {
  id: string;
  rawSignalId: string;
  aiAnalysis: SignalAnalysis;
  reviewedAnalysis?: SignalAnalysis;
  reviewStatus: ReviewStatus;
  isMock: boolean;
  provider?: AnalysisProvider;
  modelName?: string;
  promptVersion: PromptVersion;
  createdAt: string;
  reviewedAt?: string;
  modifiedFields?: Array<keyof SignalAnalysis>;
}

export const PRODUCT_MODULE_OPTIONS: ProductModule[] = [
  '地图浏览与图层',
  '轨迹记录',
  '轨迹详情与复盘',
  '离线地图',
  '标记点与现场记录',
  '路线规划与导航',
  '文件导入导出',
  '用户记录与资产管理',
  '分享与跨端流转',
  '社区与内容',
  '搜索与地点数据',
  '性能与稳定性',
  '设备与权限',
  '账号、收费与广告',
  '其他'
];

export const SIGNAL_TYPE_OPTIONS: SignalType[] = [
  '功能故障',
  '稳定性问题',
  '操作体验问题',
  '入口难找',
  '功能缺失',
  '功能建议',
  '数据错误',
  '性能与耗电',
  '权限与兼容问题',
  '收费与广告问题',
  '正向体验',
  '无有效信息',
  '新增功能',
  '流程优化',
  '交互改版',
  '数据能力增强',
  '性能与稳定性优化',
  '社区与内容更新',
  '收费或商业化调整',
  '功能下线',
  '常规修复',
  '无实质变化'
];

export const IMPACT_LEVEL_OPTIONS: ImpactLevel[] = ['高', '中', '低', '无效'];

export const RECOMMENDED_ACTION_OPTIONS: RecommendedAction[] = [
  '保留',
  '补充',
  '继续观察',
  '暂不处理'
];
