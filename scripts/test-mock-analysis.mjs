import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const root = process.cwd();
const require = createRequire(import.meta.url);
const sourcePath = path.join(root, 'src', 'services', 'analysis', 'mock-analyze-signal.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    esModuleInterop: true
  },
  fileName: sourcePath
}).outputText;

const module = { exports: {} };
vm.runInNewContext(transpiled, {
  exports: module.exports,
  module,
  require,
  console
});

const { mockAnalyzeSignal } = module.exports;

function rawSignal(content) {
  return {
    id: `raw-${Math.random().toString(36).slice(2)}`,
    batchId: 'batch-test',
    productGroup: 'outdoor_map',
    productName: '两步路',
    sourceChannel: 'community_comment',
    rawContent: content,
    status: 'pending_analysis',
    isSynthetic: true,
    importedAt: new Date().toISOString()
  };
}

const cases = [
  {
    name: 'track recording interrupted in background',
    input: '爬山时轨迹记录放到后台就中断了，最后一段没保存，复盘时很麻烦。',
    expected: {
      module: '轨迹记录',
      signalType: '稳定性问题',
      impactLevel: '高',
      recommendedAction: '补充'
    }
  },
  {
    name: 'offline map entry or coverage',
    input: '离线地图下载入口太不明显，而且覆盖范围看不清楚，出发前很难确认。',
    expected: {
      module: '离线地图',
      signalType: '入口难找',
      impactLevel: '中',
      recommendedAction: '保留'
    }
  },
  {
    name: 'marker photo workflow',
    input: '标记点希望能直接拍照并从相册补照片，现在现场记录还要切来切去。',
    expected: {
      module: '标记点与现场记录',
      signalType: '操作体验问题',
      impactLevel: '中',
      recommendedAction: '补充'
    }
  },
  {
    name: 'track replay metrics missing',
    input: '轨迹复盘里缺少累计爬升、海拔变化和持续时间，判断路线难度不方便。',
    expected: {
      module: '轨迹详情与复盘',
      signalType: '功能缺失',
      impactLevel: '中',
      recommendedAction: '补充'
    }
  },
  {
    name: 'share link cannot open',
    input: '路线分享给朋友后链接打不开，对方只能让我重新截图发过去。',
    expected: {
      module: '分享与跨端流转',
      signalType: '功能故障',
      impactLevel: '中',
      recommendedAction: '保留'
    }
  },
  {
    name: 'ads or membership issue',
    input: '广告太多了，很多基础功能还提示开会员，使用路线规划时很打断。',
    expected: {
      module: '账号、收费与广告',
      signalType: '收费与广告问题',
      impactLevel: '中',
      recommendedAction: '继续观察'
    }
  },
  {
    name: 'invalid short comment',
    input: '垃圾',
    expected: {
      module: '其他',
      signalType: '无有效信息',
      impactLevel: '无效',
      recommendedAction: '暂不处理'
    }
  }
];

for (const testCase of cases) {
  const analysis = mockAnalyzeSignal(rawSignal(testCase.input));
  assert.equal(analysis.module, testCase.expected.module);
  assert.equal(analysis.signalType, testCase.expected.signalType);
  assert.equal(analysis.impactLevel, testCase.expected.impactLevel);
  assert.equal(analysis.recommendedAction, testCase.expected.recommendedAction);
  assert.ok(analysis.coreConclusion.length > 0);
  assert.ok(analysis.userScenario.length > 0);
  assert.ok(analysis.evidenceQuote.length > 0);
  assert.ok(analysis.productInsight.length > 0);
  assert.ok(analysis.confidence >= 0 && analysis.confidence <= 1);
  console.log(`PASS ${testCase.name}`);
}

console.log(`\n${cases.length}/${cases.length} mock analysis tests passed.`);
