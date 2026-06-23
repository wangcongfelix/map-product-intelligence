import { SOURCE_CHANNEL_LABELS } from '@/lib/import/import-options';
import {
  IMPACT_LEVEL_OPTIONS,
  PRODUCT_MODULE_OPTIONS,
  RECOMMENDED_ACTION_OPTIONS,
  SIGNAL_TYPE_OPTIONS
} from '@/types/analysis';
import type { RawSignal } from '@/types/import';

export const ANALYSIS_PROMPT_VERSION = 'v1';

export const ANALYSIS_SYSTEM_PROMPT = `你是地图、出行与户外产品经理的用户声音分析助手。你的任务是把应用评论、竞品更新日志、社区反馈或体验记录转成可审核的产品信号。你必须严格按给定 JSON schema 输出，不得输出 Markdown、解释或额外文字。所有分类字段必须从给定枚举中选择。不要编造原文没有的信息。分类时必须先给出最接近的明确模块和信号类型，人工审核会负责纠偏；低置信度也要给出首选判断，并通过 confidence 表示不确定。只有文本极短、极模糊、没有任何产品对象或场景时，才允许使用 module=其他、signalType=无有效信息。`;

export function buildAnalysisUserPrompt(rawSignal: RawSignal): string {
  return `请分析下面这条地图产品资料，并只输出 JSON。

产品类型：${rawSignal.productGroup}
产品名称：${rawSignal.productName}
资料来源：${rawSignal.customSourceName ?? SOURCE_CHANNEL_LABELS[rawSignal.sourceChannel]}
原始内容：${rawSignal.rawContent}

必须输出以下字段：
{
  "module": "枚举值",
  "signalType": "枚举值",
  "coreConclusion": "一句话核心结论",
  "userScenario": "用户使用场景",
  "impactLevel": "枚举值",
  "evidenceQuote": "来自原文的短证据",
  "productInsight": "产品启示",
  "recommendedAction": "枚举值",
  "confidence": 0.0
}

module 只能是：${PRODUCT_MODULE_OPTIONS.join('、')}
signalType 只能是：${SIGNAL_TYPE_OPTIONS.join('、')}
impactLevel 只能是：${IMPACT_LEVEL_OPTIONS.join('、')}
recommendedAction 只能是：${RECOMMENDED_ACTION_OPTIONS.join('、')}

约束：
1. 只输出 JSON，不输出 Markdown。
2. 不要使用代码块。
3. 不要编造原文没有的信息。
4. evidenceQuote 必须来自原文，可截取短句。
5. confidence 必须是 0 到 1 的数字。
6. 如果信息不足，也必须优先给出最接近的明确模块和类型，并降低 confidence。
7. 不允许输出“待人工判断”。
8. 对纯情绪、过短、无产品信息内容，使用 module=其他、signalType=无有效信息、impactLevel=无效、recommendedAction=暂不处理。
9. 不要滥用“其他”或“无有效信息”。出现路线、导航、搜索、POI、离线、轨迹、标记点、分享、社区内容、性能、权限、会员广告等线索时，必须归入对应明确模块。
10. “其他”只用于确实无法从原文判断具体产品模块的情况；此时 confidence 通常不应高于 0.55，并在 coreConclusion 或 productInsight 中说明信息不足原因。`;
}
