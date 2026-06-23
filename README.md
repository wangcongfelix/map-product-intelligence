# 地图产品情报工作台

面向地图产品团队的资料导入、AI 预分析、人工快速审核、信号总表沉淀和报告准备工作台。

## 当前阶段

V1-4：报告中心、图表统计、关键汇总表和 Markdown 报告输出。

本阶段基于 `/signals` 中人工确认后的 `reviewedAnalysis` 生成报告资产。报告生成器是确定性规则，不调用 DeepSeek；DeepSeek 仍只用于 V1-3 的预分析链路，API Key 只允许在服务端读取，不会暴露到客户端。

## 技术栈

- Next.js 16 App Router
- React 19
- TypeScript 5.7
- Tailwind CSS v4
- shadcn/ui
- Zod

## 本地启动

```bash
npm install
npm run dev
```

常用检查：

```bash
npm run test:split
npm run test:mock-analysis
npm run test:analysis-schema
npm run test:report-generator
npm run test:report-metrics
npm run build
```

默认开发地址为 `http://localhost:3000`。

## DeepSeek 配置

复制 `.env.example` 中的变量到本地 `.env.local`，填写：

```env
AI_PROVIDER=mock
DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-flash
ANALYSIS_PROMPT_VERSION=v1
```

配置 `.env.local` 后需要重启 dev 服务。不要提交 `.env.local`。

## 开源底座声明

本项目基于 `next-shadcn-dashboard-starter` 清理改造，原项目采用 MIT License。当前保留通用的 Next.js、shadcn/ui、主题、布局、表单、表格等基础能力，删除原模板演示业务、认证、Sentry、Docker、Husky、KBar 等与当前 MVP 无关的能力。

详见 [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) 和 [docs/OPEN_SOURCE_BASE_SELECTION.md](./docs/OPEN_SOURCE_BASE_SELECTION.md)。

## 当前页面

- `/import`：资料导入，支持产品与来源选择、单条/批量文本输入、拆分预览、编辑删除和确认导入。
- `/review`：待确认，可选择 Mock AI 或 DeepSeek 分析，并支持通过、修改通过、忽略。
- `/signals`：信号总表，只展示人工确认后的 `reviewedAnalysis`。
- `/reports`：报告中心，可从已确认信号中筛选、勾选，生成 4 类图表、图表 PNG 和可复制/可下载的 Markdown 报告。

`/` 会自动重定向到 `/import`。

## V1-4 边界

- 报告、图表、汇总表都只基于当前勾选的 `reviewedAnalysis` 正式信号。
- 支持复制 Markdown 和下载 `.md`。
- 当前未实现 PDF/Word 导出或 AI 报告生成。
- V1-5 再考虑 AI 报告生成、更高级导出和更完整的评估闭环。

## 尚未实现的 V1 功能

- 准确率、召回率或 badcase 评测增强
- 数据库持久化
- Excel 导入、截图识别、网页抓取或自动采集评论
