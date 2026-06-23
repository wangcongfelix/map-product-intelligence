import type { ReviewStatus, SignalAnalysis } from '@/types/analysis';

export function productBadgeClass(productName: string): string {
  if (productName.includes('高德')) return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (productName.includes('百度')) return 'border-blue-200 bg-blue-50 text-blue-700';
  if (productName.includes('腾讯')) return 'border-orange-200 bg-orange-50 text-orange-700';
  if (productName.includes('六只脚')) return 'border-violet-200 bg-violet-50 text-violet-700';
  if (productName.includes('两步路')) return 'border-cyan-200 bg-cyan-50 text-cyan-700';
  return 'border-slate-200 bg-slate-50 text-slate-700';
}

export function impactBadgeClass(impactLevel: SignalAnalysis['impactLevel']): string {
  if (impactLevel === '高') return 'border-red-200 bg-red-50 text-red-700';
  if (impactLevel === '中') return 'border-orange-200 bg-orange-50 text-orange-700';
  if (impactLevel === '低') return 'border-sky-200 bg-sky-50 text-sky-700';
  return 'border-slate-200 bg-slate-50 text-slate-600';
}

export function actionBadgeClass(action: SignalAnalysis['recommendedAction']): string {
  if (action === '保留') return 'border-blue-200 bg-blue-50 text-blue-700';
  if (action === '补充') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (action === '继续观察') return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-slate-200 bg-slate-50 text-slate-600';
}

export function reviewStatusLabel(status: ReviewStatus): string {
  if (status === 'pending_review') return '待审核';
  if (status === 'approved') return '已通过';
  if (status === 'modified') return '修改通过';
  return '已忽略';
}

export function reviewStatusBadgeClass(status: ReviewStatus): string {
  if (status === 'pending_review') return 'border-yellow-200 bg-yellow-50 text-yellow-700';
  if (status === 'approved') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (status === 'modified') return 'border-teal-200 bg-teal-50 text-teal-700';
  return 'border-slate-200 bg-slate-50 text-slate-600';
}
