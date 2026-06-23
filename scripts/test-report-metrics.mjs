import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const root = process.cwd();
const require = createRequire(import.meta.url);

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
  const module = { exports: {} };
  vm.runInNewContext(transpile(filePath), {
    exports: module.exports,
    module,
    require,
    console
  });
  return module.exports;
}

const { generateReportMetrics } = loadTs(
  path.join(root, 'src', 'services', 'reports', 'generate-report-metrics.ts')
);

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
  record('a'),
  record('b', {
    productName: '六只脚',
    sourceLabel: '版本更新日志',
    reviewedAnalysis: {
      module: '轨迹记录',
      signalType: '功能建议',
      impactLevel: '中',
      recommendedAction: '保留'
    }
  }),
  record('c', {
    productName: '高德地图',
    sourceLabel: '应用商城评论',
    reviewedAnalysis: {
      module: '离线地图',
      signalType: '入口难找',
      impactLevel: '低',
      recommendedAction: '继续观察'
    }
  })
];

const unselectedRecord = record('unselected', {
  sourceLabel: '不应统计来源',
  reviewedAnalysis: {
    module: '不应统计模块',
    signalType: '不应统计类型',
    impactLevel: '高',
    recommendedAction: '暂不处理'
  }
});

function countFor(distribution, name) {
  return distribution.find((item) => item.name === name)?.count ?? 0;
}

const cases = [
  {
    name: 'module distribution is correct',
    run: () => {
      const metrics = generateReportMetrics(selectedRecords);
      assert.equal(countFor(metrics.moduleDistribution, '轨迹记录'), 2);
      assert.equal(countFor(metrics.moduleDistribution, '离线地图'), 1);
    }
  },
  {
    name: 'source distribution is correct',
    run: () => {
      const metrics = generateReportMetrics(selectedRecords);
      assert.equal(countFor(metrics.sourceDistribution, '社区或评论区'), 1);
      assert.equal(countFor(metrics.sourceDistribution, '版本更新日志'), 1);
      assert.equal(countFor(metrics.sourceDistribution, '应用商城评论'), 1);
    }
  },
  {
    name: 'signal type distribution is correct',
    run: () => {
      const metrics = generateReportMetrics(selectedRecords);
      assert.equal(countFor(metrics.signalTypeDistribution, '稳定性问题'), 1);
      assert.equal(countFor(metrics.signalTypeDistribution, '功能建议'), 1);
      assert.equal(countFor(metrics.signalTypeDistribution, '入口难找'), 1);
    }
  },
  {
    name: 'impact distribution is correct',
    run: () => {
      const metrics = generateReportMetrics(selectedRecords);
      assert.equal(countFor(metrics.impactDistribution, '高'), 1);
      assert.equal(countFor(metrics.impactDistribution, '中'), 1);
      assert.equal(countFor(metrics.impactDistribution, '低'), 1);
    }
  },
  {
    name: 'high impact records enter high impact table',
    run: () => {
      const metrics = generateReportMetrics(selectedRecords);
      assert.equal(metrics.highImpactRows.length, 1);
      assert.equal(metrics.highImpactRows[0].id, 'a');
    }
  },
  {
    name: 'recommended action distribution is correct',
    run: () => {
      const metrics = generateReportMetrics(selectedRecords);
      assert.equal(countFor(metrics.actionDistribution, '补充'), 1);
      assert.equal(countFor(metrics.actionDistribution, '保留'), 1);
      assert.equal(countFor(metrics.actionDistribution, '继续观察'), 1);
    }
  },
  {
    name: 'empty records return empty arrays',
    run: () => {
      const metrics = generateReportMetrics([]);
      assert.equal(metrics.moduleDistribution.length, 0);
      assert.equal(metrics.sourceDistribution.length, 0);
      assert.equal(metrics.highImpactRows.length, 0);
      assert.equal(metrics.summaryRows.length, 0);
      assert.equal(metrics.opportunityRows.length, 0);
    }
  },
  {
    name: 'metrics only use selected records',
    run: () => {
      const metrics = generateReportMetrics(selectedRecords);
      assert.equal(countFor(metrics.moduleDistribution, unselectedRecord.reviewedAnalysis.module), 0);
      assert.equal(countFor(metrics.sourceDistribution, unselectedRecord.sourceLabel), 0);
    }
  }
];

for (const testCase of cases) {
  testCase.run();
  console.log(`PASS ${testCase.name}`);
}

console.log(`\n${cases.length}/${cases.length} report metrics tests passed.`);
