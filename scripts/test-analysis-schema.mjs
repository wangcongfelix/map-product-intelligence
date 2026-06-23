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

function runModule(code, customRequire = require) {
  const module = { exports: {} };
  vm.runInNewContext(code, {
    exports: module.exports,
    module,
    require: customRequire,
    console
  });
  return module.exports;
}

const analysisTypeExports = runModule(transpile(path.join(root, 'src', 'types', 'analysis.ts')));
const schemaExports = runModule(
  transpile(path.join(root, 'src', 'services', 'analysis', 'analysis-schema.ts')),
  (specifier) => {
    if (specifier === '@/types/analysis') return analysisTypeExports;
    return require(specifier);
  }
);

const { parseSignalAnalysisJson, validateSignalAnalysis } = schemaExports;

function validAnalysis(extra = {}) {
  return {
    module: '轨迹记录',
    signalType: '稳定性问题',
    coreConclusion: '后台轨迹记录中断。',
    userScenario: '用户在户外运动中依赖轨迹持续记录。',
    impactLevel: '高',
    evidenceQuote: '轨迹记录放到后台就中断了',
    productInsight: '需要提升后台记录稳定性。',
    recommendedAction: '补充',
    confidence: 0.9,
    ...extra
  };
}

const cases = [
  {
    name: 'valid SignalAnalysis passes',
    run: () => {
      const result = validateSignalAnalysis(validAnalysis());
      assert.equal(result.module, '轨迹记录');
    }
  },
  {
    name: 'missing field fails',
    run: () => {
      const input = validAnalysis();
      delete input.coreConclusion;
      assert.throws(() => validateSignalAnalysis(input));
    }
  },
  {
    name: 'invalid module fails',
    run: () => assert.throws(() => validateSignalAnalysis(validAnalysis({ module: '错误模块' })))
  },
  {
    name: 'invalid signalType fails',
    run: () => assert.throws(() => validateSignalAnalysis(validAnalysis({ signalType: '错误类型' })))
  },
  {
    name: 'invalid impactLevel fails',
    run: () => assert.throws(() => validateSignalAnalysis(validAnalysis({ impactLevel: '严重' })))
  },
  {
    name: 'invalid recommendedAction fails',
    run: () =>
      assert.throws(() => validateSignalAnalysis(validAnalysis({ recommendedAction: '立刻开发' })))
  },
  {
    name: 'confidence below zero fails',
    run: () => assert.throws(() => validateSignalAnalysis(validAnalysis({ confidence: -0.1 })))
  },
  {
    name: 'confidence above one fails',
    run: () => assert.throws(() => validateSignalAnalysis(validAnalysis({ confidence: 1.1 })))
  },
  {
    name: 'Markdown fenced JSON can be cleaned and parsed',
    run: () => {
      const result = parseSignalAnalysisJson(`\`\`\`json\n${JSON.stringify(validAnalysis())}\n\`\`\``);
      assert.equal(result.signalType, '稳定性问题');
    }
  },
  {
    name: 'extra fields are safely ignored',
    run: () => {
      const result = validateSignalAnalysis(validAnalysis({ apiKey: 'should-not-survive' }));
      assert.equal(Object.hasOwn(result, 'apiKey'), false);
    }
  }
];

for (const testCase of cases) {
  testCase.run();
  console.log(`PASS ${testCase.name}`);
}

console.log(`\n${cases.length}/${cases.length} analysis schema tests passed.`);
