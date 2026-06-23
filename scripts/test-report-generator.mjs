import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const root = process.cwd();
const require = createRequire(import.meta.url);
const moduleCache = new Map();

function transpile(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  return ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true
    },
    fileName: filePath
  }).outputText;
}

function loadTs(filePath) {
  if (moduleCache.has(filePath)) return moduleCache.get(filePath);

  const module = { exports: {} };
  moduleCache.set(filePath, module.exports);
  vm.runInNewContext(transpile(filePath), {
    exports: module.exports,
    module,
    require: (specifier) => {
      if (specifier === '@/services/reports/generate-report-metrics') {
        return loadTs(path.join(root, 'src', 'services', 'reports', 'generate-report-metrics.ts'));
      }
      return require(specifier);
    },
    console,
    crypto,
    Intl
  });
  moduleCache.set(filePath, module.exports);
  return module.exports;
}

const { generateReport } = loadTs(path.join(root, 'src', 'services', 'reports', 'generate-report.ts'));

function record(id, overrides = {}) {
  return {
    id,
    rawSignalId: `raw-${id}`,
    productName: '两步路',
    sourceChannel: 'community_comment',
    sourceLabel: '社区或评论区',
    rawContent: '原始用户声音',
    provider: 'mock',
    promptVersion: 'mock-v1',
    reviewStatus: 'approved',
    createdAt: '2026-06-01T00:00:00.000Z',
    reviewedAt: '2026-06-02T00:00:00.000Z',
    reviewedAnalysis: {
      module: '轨迹记录',
      signalType: '稳定性问题',
      coreConclusion: `核心结论 ${id}`,
      userScenario: '户外记录轨迹',
      impactLevel: '高',
      evidenceQuote: `证据 ${id}`,
      productInsight: `产品启示 ${id}`,
      recommendedAction: '补充',
      confidence: 0.9,
      ...overrides.reviewedAnalysis
    },
    ...overrides
  };
}

const selectedRecords = [
  record('selected-1'),
  record('selected-2', {
    productName: '六只脚',
    sourceLabel: '版本更新日志',
    reviewedAnalysis: {
      module: '社区与内容',
      signalType: '功能建议',
      impactLevel: '中',
      coreConclusion: '社区路线缺少季节筛选',
      evidenceQuote: '希望能按季节筛选路线',
      productInsight: '可把路线筛选做成决策入口',
      recommendedAction: '保留'
    }
  }),
  record('selected-3', {
    reviewedAnalysis: {
      module: '离线地图',
      signalType: '入口难找',
      impactLevel: '低',
      coreConclusion: '离线地图入口不明显',
      evidenceQuote: '找不到提前缓存的位置',
      productInsight: '需要强化离线入口',
      recommendedAction: '继续观察'
    }
  })
];

const unselected = record('unselected-secret', {
  reviewedAnalysis: {
    coreConclusion: '不应出现在报告中的未选中结论',
    evidenceQuote: '未选中证据',
    productInsight: '未选中启示'
  }
});

const cases = [
  {
    name: 'empty records throw a clear error',
    run: () => {
      assert.throws(
        () =>
          generateReport({
            title: '空报告',
            reportType: '用户声音阶段分析',
            selectedRecords: [],
            generatedAt: '2026-06-22T00:00:00.000Z'
          }),
        /至少需要选择 1 条/
      );
    }
  },
  {
    name: 'three records generate markdown with title',
    run: () => {
      const report = generateReport({
        title: '地图报告',
        reportType: '用户声音阶段分析',
        selectedRecords,
        generatedAt: '2026-06-22T00:00:00.000Z'
      });
      assert.match(report.markdown, /^# 地图报告/);
    }
  },
  {
    name: 'required sections are present',
    run: () => {
      const report = generateReport({
        title: '地图报告',
        reportType: '用户声音阶段分析',
        selectedRecords,
        generatedAt: '2026-06-22T00:00:00.000Z'
      });
      assert.match(report.markdown, /## 一、结论摘要/);
      assert.match(report.markdown, /## 二、分析范围/);
      assert.match(report.markdown, /## 三、本期关键数据/);
      assert.match(report.markdown, /## 四、重点发现/);
      assert.match(report.markdown, /## 五、竞品与用户声音摘要/);
      assert.match(report.markdown, /## 六、产品机会与建议动作/);
      assert.match(report.markdown, /## 七、下阶段建议/);
      assert.match(report.markdown, /## 八、证据索引/);
    }
  },
  {
    name: 'evidence index includes evidenceQuote',
    run: () => {
      const report = generateReport({
        title: '地图报告',
        reportType: '用户声音阶段分析',
        selectedRecords,
        generatedAt: '2026-06-22T00:00:00.000Z'
      });
      assert.match(report.markdown, /证据 selected-1/);
      assert.match(report.markdown, /希望能按季节筛选路线/);
    }
  },
  {
    name: 'unselected records are not included',
    run: () => {
      const report = generateReport({
        title: '地图报告',
        reportType: '用户声音阶段分析',
        selectedRecords,
        generatedAt: '2026-06-22T00:00:00.000Z'
      });
      assert.equal(report.markdown.includes(unselected.reviewedAnalysis.coreConclusion), false);
    }
  },
  {
    name: 'selectedRecordIds are returned',
    run: () => {
      const report = generateReport({
        title: '地图报告',
        reportType: '用户声音阶段分析',
        selectedRecords,
        generatedAt: '2026-06-22T00:00:00.000Z'
      });
      assert.deepEqual(report.selectedRecordIds, ['selected-1', 'selected-2', 'selected-3']);
    }
  },
  {
    name: 'human-confirmed source statement is present',
    run: () => {
      const report = generateReport({
        title: '地图报告',
        reportType: '用户声音阶段分析',
        selectedRecords,
        generatedAt: '2026-06-22T00:00:00.000Z'
      });
      assert.match(report.markdown, /基于人工确认后的产品信号生成/);
    }
  }
];

for (const testCase of cases) {
  testCase.run();
  console.log(`PASS ${testCase.name}`);
}

console.log(`\n${cases.length}/${cases.length} report generator tests passed.`);
