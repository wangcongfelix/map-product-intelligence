import type {
  CustomProductCategory,
  ProductGroup,
  RawSignalStatus,
  SourceChannel
} from '@/types/import';

export const PRODUCT_GROUP_LABELS: Record<ProductGroup, string> = {
  general_map: '综合地图',
  outdoor_map: '户外专业地图',
  custom: '自定义产品'
};

export const CUSTOM_PRODUCT_CATEGORY_LABELS: Record<CustomProductCategory, string> = {
  general_map: '综合地图',
  outdoor_map: '户外专业地图',
  other_mobility: '其他地图或出行产品'
};

export const PRESET_PRODUCTS: Record<Exclude<ProductGroup, 'custom'>, string[]> = {
  general_map: ['高德地图', '百度地图', '腾讯地图'],
  outdoor_map: ['两步路', '六只脚', '奥维互动地图']
};

export const SOURCE_CHANNEL_LABELS: Record<SourceChannel, string> = {
  app_store_review: '应用商城评论',
  community_comment: '社区或评论区',
  release_notes: '版本更新日志',
  official_announcement: '官网公告',
  competitor_observation: '竞品体验记录',
  other: '其他'
};

export const SOURCE_CHANNEL_HINTS: Record<SourceChannel, string> = {
  app_store_review: '适合导入用户评价、评分和版本反馈。',
  community_comment: '适合导入公开讨论和用户问题。',
  release_notes: '适合导入新增功能、优化和修复说明。',
  official_announcement: '适合导入正式功能公告和产品动态。',
  competitor_observation: '适合导入产品经理自己的体验笔记。',
  other: '由用户补充资料来源。'
};

export const RAW_SIGNAL_STATUS_LABELS: Record<RawSignalStatus, string> = {
  pending_analysis: '待分析',
  processing: '处理中',
  analysis_failed: '分析失败',
  pending_review: '待确认',
  approved: '已通过',
  ignored: '已忽略'
};

export const SYNTHETIC_IMPORT_EXAMPLE = `示例数据 / synthetic_test_case

1. 高德地图最近路线规划说明更清楚了，但步行和骑行入口有点分散，希望首页能更快切换。

2. 百度地图离线地图下载入口不太明显，户外信号差的时候找不到提前缓存的位置。

3. 腾讯地图公交换乘提醒比较及时，但到站前的语音提示有时太频繁，影响听音乐。

4. 两步路轨迹记录很适合爬山，不过导入 GPX 后路线名称需要手动改，批量管理不够方便。

5. 六只脚社区里的路线评论很有参考价值，希望能按季节和难度筛选，避免新手选到高风险线路。`;
