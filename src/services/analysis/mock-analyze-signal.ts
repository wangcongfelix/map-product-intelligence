import type { SignalAnalysis } from '@/types/analysis';
import type { RawSignal } from '@/types/import';

function includesAny(content: string, keywords: string[]): boolean {
  return keywords.some((keyword) => content.includes(keyword));
}

function normalizeConfidence(value: number): number {
  return Math.min(1, Math.max(0, Number(value.toFixed(2))));
}

function buildEvidenceQuote(content: string): string {
  const normalized = content.replace(/\s+/g, ' ').trim();
  return normalized.length > 80 ? `${normalized.slice(0, 80)}...` : normalized;
}

function isLowInformation(content: string): boolean {
  const normalized = content.replace(/\s+/g, '').trim();
  const lowInfoTexts = ['垃圾', '不好用', '差评', '难用', '一般', '无语', '不好'];

  return normalized.length <= 6 || lowInfoTexts.includes(normalized);
}

export function mockAnalyzeSignal(rawSignal: RawSignal): SignalAnalysis {
  const content = rawSignal.rawContent.trim();
  const evidenceQuote = buildEvidenceQuote(content);

  if (isLowInformation(content)) {
    return {
      module: '其他',
      signalType: '无有效信息',
      coreConclusion: '原始资料信息量不足，暂时无法提炼明确产品信号。',
      userScenario: '用户只表达了简短情绪或笼统评价，没有给出具体场景。',
      impactLevel: '无效',
      evidenceQuote,
      productInsight: '该类资料可保留为噪声样本，但不应进入正式信号判断。',
      recommendedAction: '暂不处理',
      confidence: 0.42
    };
  }

  if (
    includesAny(content, ['轨迹', '记录']) &&
    includesAny(content, ['后台', '中断', '断了', '没保存'])
  ) {
    return {
      module: '轨迹记录',
      signalType: '稳定性问题',
      coreConclusion: '用户在轨迹记录过程中遇到中断或保存失败风险。',
      userScenario: '户外或长距离移动时，用户依赖持续轨迹记录来保存行程资产。',
      impactLevel: '高',
      evidenceQuote,
      productInsight: '轨迹记录是户外地图的核心资产能力，应优先保障后台持续记录和异常恢复。',
      recommendedAction: '补充',
      confidence: 0.9
    };
  }

  if (includesAny(content, ['离线地图', '下载', '覆盖', '入口'])) {
    const isEntryIssue = includesAny(content, ['入口', '找不到', '不明显', '藏得深']);
    return {
      module: '离线地图',
      signalType: isEntryIssue ? '入口难找' : '操作体验问题',
      coreConclusion: isEntryIssue
        ? '用户对离线地图入口可发现性存在明显困扰。'
        : '用户对离线地图下载或覆盖范围体验存在不满。',
      userScenario: '弱网、无网或出行前准备时，用户需要提前下载和确认地图覆盖范围。',
      impactLevel: isEntryIssue ? '中' : '高',
      evidenceQuote,
      productInsight: '离线地图应降低入口查找成本，并清楚反馈下载范围与可用状态。',
      recommendedAction: isEntryIssue ? '保留' : '补充',
      confidence: 0.84
    };
  }

  if (includesAny(content, ['标记点', '拍照', '相册', '照片'])) {
    return {
      module: '标记点与现场记录',
      signalType: includesAny(content, ['不能', '缺少', '没有', '不支持']) ? '功能缺失' : '操作体验问题',
      coreConclusion: '用户希望标记点能更顺畅地承载现场照片和记录信息。',
      userScenario: '巡检、徒步、踩点等场景中，用户需要把位置、照片和备注绑定保存。',
      impactLevel: '中',
      evidenceQuote,
      productInsight: '标记点能力应围绕现场记录效率优化，减少照片补录和资料整理成本。',
      recommendedAction: '补充',
      confidence: 0.82
    };
  }

  if (includesAny(content, ['爬升', '海拔', '持续时间', '复盘'])) {
    return {
      module: '轨迹详情与复盘',
      signalType: '功能缺失',
      coreConclusion: '用户希望轨迹复盘呈现更完整的运动和路线指标。',
      userScenario: '完成路线后，用户通过爬升、海拔、耗时等指标评估路线难度和个人表现。',
      impactLevel: '中',
      evidenceQuote,
      productInsight: '复盘指标会影响用户对路线资产的长期管理和分享意愿。',
      recommendedAction: '补充',
      confidence: 0.8
    };
  }

  if (includesAny(content, ['分享', '打不开', '链接'])) {
    return {
      module: '分享与跨端流转',
      signalType: includesAny(content, ['打不开', '失效', '错误']) ? '功能故障' : '操作体验问题',
      coreConclusion: '分享链路存在打开失败或跨端承接不顺的问题。',
      userScenario: '用户把路线、地点或记录分享给同伴后，对方需要顺利打开并继续使用。',
      impactLevel: '中',
      evidenceQuote,
      productInsight: '分享链路的稳定性直接影响多人出行协作和内容传播。',
      recommendedAction: '保留',
      confidence: 0.78
    };
  }

  if (includesAny(content, ['广告', '会员', '收费'])) {
    return {
      module: '账号、收费与广告',
      signalType: '收费与广告问题',
      coreConclusion: '用户对广告、会员或收费策略存在体验敏感点。',
      userScenario: '用户在核心操作过程中遇到商业化触点，可能影响继续使用意愿。',
      impactLevel: includesAny(content, ['太多', '频繁', '必须']) ? '中' : '低',
      evidenceQuote,
      productInsight: '商业化触点需要控制出现时机，避免压过核心地图任务。',
      recommendedAction: '继续观察',
      confidence: 0.74
    };
  }

  if (includesAny(content, ['路线规划', '导航', '绕路', '换乘', '公交', '步行', '骑行'])) {
    return {
      module: '路线规划与导航',
      signalType: includesAny(content, ['绕路', '不准', '错误', '打不开']) ? '功能故障' : '操作体验问题',
      coreConclusion: '用户对路线规划或导航过程中的效率与准确性存在明确反馈。',
      userScenario: '通勤、步行、骑行或户外出行前，用户需要快速获得可信路线并顺利导航。',
      impactLevel: includesAny(content, ['绕路', '不准', '错误']) ? '高' : '中',
      evidenceQuote,
      productInsight: '路线与导航体验直接影响地图产品的核心信任，应优先定位具体场景和失败原因。',
      recommendedAction: '补充',
      confidence: 0.78
    };
  }

  if (includesAny(content, ['搜索', 'POI', '地点', '地址', '店铺', '位置'])) {
    return {
      module: '搜索与地点数据',
      signalType: includesAny(content, ['错误', '不准', '找不到', '过期']) ? '数据错误' : '功能建议',
      coreConclusion: '用户反馈集中在地点检索或 POI 数据质量上。',
      userScenario: '用户通过搜索地点、店铺或地址完成出行决策，需要结果准确且容易确认。',
      impactLevel: includesAny(content, ['错误', '不准', '找不到']) ? '高' : '中',
      evidenceQuote,
      productInsight: '地点数据质量会直接影响路线、到店和分享等后续链路。',
      recommendedAction: '补充',
      confidence: 0.76
    };
  }

  if (includesAny(content, ['社区', '路线评论', '评论', '难度', '季节', '筛选'])) {
    return {
      module: '社区与内容',
      signalType: includesAny(content, ['筛选', '希望', '建议']) ? '功能建议' : '数据错误',
      coreConclusion: '用户希望路线内容和社区信息更容易筛选和判断。',
      userScenario: '用户在选择户外路线前，会依赖评论、季节、难度等内容判断路线是否适合自己。',
      impactLevel: '中',
      evidenceQuote,
      productInsight: '内容筛选能力能降低路线选择成本，也能提升新手安全感。',
      recommendedAction: '补充',
      confidence: 0.74
    };
  }

  if (includesAny(content, ['GPX', 'KML', '导入', '导出', '文件'])) {
    return {
      module: '文件导入导出',
      signalType: includesAny(content, ['不能', '失败', '错误']) ? '功能故障' : '流程优化',
      coreConclusion: '用户在路线文件导入导出或批量管理上存在效率诉求。',
      userScenario: '户外用户会导入路线文件、整理轨迹资产，并在不同工具之间迁移数据。',
      impactLevel: '中',
      evidenceQuote,
      productInsight: '文件互通能力影响专业用户的长期留存和跨平台迁移体验。',
      recommendedAction: '补充',
      confidence: 0.76
    };
  }

  if (includesAny(content, ['卡顿', '闪退', '耗电', '发热', '加载慢'])) {
    return {
      module: '性能与稳定性',
      signalType: includesAny(content, ['耗电', '发热']) ? '性能与耗电' : '稳定性问题',
      coreConclusion: '用户反馈性能或稳定性问题影响连续使用体验。',
      userScenario: '长时间导航、记录轨迹或浏览地图时，用户需要应用稳定且资源消耗可控。',
      impactLevel: '高',
      evidenceQuote,
      productInsight: '性能稳定性问题会放大户外和导航场景下的风险感，应优先排查。',
      recommendedAction: '补充',
      confidence: 0.79
    };
  }

  if (includesAny(content, ['好用', '清晰', '及时', '方便', '顺畅', '准确'])) {
    return {
      module: includesAny(content, ['导航', '路线', '公交']) ? '路线规划与导航' : '地图浏览与图层',
      signalType: '正向体验',
      coreConclusion: '用户对当前体验给出正向反馈。',
      userScenario: '用户在实际使用地图能力时感受到效率或准确性提升。',
      impactLevel: '低',
      evidenceQuote,
      productInsight: '正向反馈可用于识别应继续保持的体验优势。',
      recommendedAction: '保留',
      confidence: 0.68
    };
  }

  return {
    module: rawSignal.productGroup === 'outdoor_map' ? '用户记录与资产管理' : '地图浏览与图层',
    signalType: '功能建议',
    coreConclusion: '资料包含产品体验反馈，当前先归入最接近的地图使用模块。',
    userScenario: '用户在地图产品使用过程中提出了较开放的体验或能力诉求。',
    impactLevel: '低',
    evidenceQuote,
    productInsight: '该类开放反馈可先进入人工审核，由产品经理进一步修正具体模块。',
    recommendedAction: '继续观察',
    confidence: normalizeConfidence(0.6)
  };
}
