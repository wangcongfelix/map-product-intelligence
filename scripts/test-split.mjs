import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const root = process.cwd();
const require = createRequire(import.meta.url);
const sourcePath = path.join(root, 'src', 'lib', 'import', 'split-source-text.ts');
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

const { splitSourceText } = module.exports;

const cases = [
  {
    name: 'single text',
    input: '这是一条完整的应用商城评论，描述了导航体验。',
    expect: (result) => {
      assert.equal(result.count, 1);
      assert.equal(result.items[0].content, '这是一条完整的应用商城评论，描述了导航体验。');
    }
  },
  {
    name: 'blank line delimiter',
    input: '第一条资料内容较完整。\n\n第二条资料内容也较完整。',
    expect: (result) => assert.equal(result.count, 2)
  },
  {
    name: 'dash delimiter',
    input: '第一条资料内容较完整。\n---\n第二条资料内容也较完整。',
    expect: (result) => assert.equal(result.count, 2)
  },
  {
    name: 'number dot delimiter',
    input: '1. 第一条资料内容较完整。\n2. 第二条资料内容也较完整。',
    expect: (result) => {
      assert.equal(result.count, 2);
      assert.equal(result.items[0].content, '第一条资料内容较完整。');
    }
  },
  {
    name: 'Chinese number delimiter',
    input: '1、第一条资料内容较完整。\n2、第二条资料内容也较完整。',
    expect: (result) => assert.equal(result.count, 2)
  },
  {
    name: 'parenthesized number delimiter',
    input: '（1）第一条资料内容较完整。\n(2) 第二条资料内容也较完整。',
    expect: (result) => assert.equal(result.count, 2)
  },
  {
    name: 'normal inner line break',
    input: '这是一条资料的第一行。\n这是同一条资料的第二行，不应被拆开。',
    expect: (result) => assert.equal(result.count, 1)
  },
  {
    name: 'Windows CRLF',
    input: '第一条资料内容较完整。\r\n\r\n第二条资料内容也较完整。',
    expect: (result) => assert.equal(result.count, 2)
  },
  {
    name: 'exact duplicate warning',
    input: '重复资料内容用于检测。\n\n重复资料内容用于检测。',
    expect: (result) => {
      assert.equal(result.count, 2);
      assert.ok(result.warnings.includes('检测到完全重复资料'));
      assert.ok(result.items.every((item) => item.warnings.includes('检测到完全重复资料')));
    }
  },
  {
    name: 'empty text',
    input: '   \n  ',
    expect: (result) => {
      assert.equal(result.count, 0);
      assert.ok(result.warnings.includes('内容不能为空'));
    }
  }
];

for (const testCase of cases) {
  const result = splitSourceText(testCase.input);
  testCase.expect(result);
  console.log(`PASS ${testCase.name}: ${result.count} item(s)`);
}

console.log(`\n${cases.length}/${cases.length} split tests passed.`);
