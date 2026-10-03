# ioy SaaS Skill

An Agent Skill for building an independent Cloudflare AI SaaS using [ioy.ai](https://ioy.ai). Includes an eight-part intake, asset specifications, launch checks, and a bridge to the template's project generator.

**This Skill is public. The SaaS template remains private. Installation does not include template source or grant repository access. You need an authorized local template copy.** The MIT license applies only to files in this public repository; it does not relicense the template or its licensed dependencies/assets.

## 1. Install in Codex

Install Node.js **22.20 or newer** and Git, then run:

```sh
npx --yes skills@1.7.0 add lvyinchao/ioy-saas-skill -s ioy-saas -a codex -g -y
```

This uses the MIT-licensed [Vercel skills CLI](https://github.com/vercel-labs/skills), pinned to the tested installer version. `-s` selects the Skill, `-a codex` selects Codex, `-g` installs globally, and `-y` skips installer prompts. Reopen Codex/start a new session to load the Skill. Other supported agents can use their own `-a` identifier.

The tested installer places this Skill in the shared `~/.agents/skills/ioy-saas` directory supported by Codex. This location is not changed by `CODEX_HOME`. To install only for a project, run the command in that project and omit `-g`. Check discovery with `npx --yes skills@1.7.0 list -a codex -g`.

## 2. Prepare your template

Use a local copy you are entitled to use. Existing collaborators can clone the private template with their own GitHub authorization. If you do not have access, contact **c@ioy.ai**; installing this Skill does not bypass that prerequisite.

Give Codex the template path, or set `SAAS_TEMPLATE` in the environment used to launch Codex. Never place service keys in a prompt or requirements file.

## 3. Ask Codex to create your product

```text
Use $ioy-saas to build my AI writing SaaS.
My authorized template is at /absolute/path/ioy-template.
Generate the independent project in /absolute/path/first-draft (an empty directory).
Collect missing requirements. Start with English, Cloudflare, and Waffo billing.
```

Codex collects positioning, workflow, input/output, models, billing, API, brand, and operating information. It then delegates to your installed template's generator. The generated project runs independently and records its template version.

Follow the generated README to install dependencies, initialize local secrets and the database, run checks, and preview the application. Local model/email simulation is not a live service. Configure **your own** Cloudflare, Google, email, AI, payment, and analytics services before preview/production acceptance. See [configuration](https://ioy.ai/docs/configuration), [quickstart](https://ioy.ai/docs/quickstart), and [project generation](https://ioy.ai/docs/create-product).

## Manual generator bridge

From a clone of this public repository:

```sh
node skills/ioy-saas/scripts/create-project.mjs --template /absolute/path/ioy-template --check
cp skills/ioy-saas/references/requirements.json requirements.local.json
# Edit requirements.local.json with non-secret product requirements.
node skills/ioy-saas/scripts/create-project.mjs --template /absolute/path/ioy-template --config requirements.local.json --out /absolute/path/first-draft
```

| Parameter | Meaning |
| --- | --- |
| `--template` | Authorized template directory; falls back to `SAAS_TEMPLATE`, then current directory |
| `--config` | JSON requirements file; see the included example and your template's schema |
| `--out` | Empty output directory outside the template; existing files are preserved |
| `--check` | Check required local files without creating anything; does not verify legal entitlement |
| `--help` | Show usage |

The example includes `.example` addresses, text workflow, Waffo, API enabled, 30-day retention, and English. Update them for your product. The bridge rejects credential-named fields and recognizable credential strings; this is a guard, not a comprehensive secret scanner. Keep all credentials outside requirements. Exact provider variables, keys, callbacks, and binding setup are documented in the authorized template and generated README.

## 中文：第一次使用

1. 准备 Node.js 22.20+、Git，以及有权使用的模板本地副本。没有模板访问权限时联系 c@ioy.ai。
2. 运行上面的一行安装命令，然后重新打开 Codex 或开始新会话。
3. 输入 `$ioy-saas`，说明产品用途、模板路径和新项目的空目录；Codex 会补齐八类关键需求。
4. Skill 调用本地模板生成独立项目。按生成项目的 README 安装依赖、初始化本地密钥和数据库，启动并检查页面及实际结果。
5. 在环境变量或 Cloudflare Secrets 中配置自己的 Google、邮件、模型、支付和分析服务，完成测试环境验收后再发布。不要把 key 写进聊天、需求文件、Skill 或 Git。

模板参数、服务 key、回调地址和部署步骤见[配置文档](https://ioy.ai/docs/configuration)。安装 Skill 不等于下载私有源码，也不等于完成生产上线。公开仓库不包含模板源码、生产资源 ID、运行数据、密钥或模板 Git 历史。

## Validate this package

```sh
npm test
```

Tests use isolated temporary fixtures and do not contact providers or deploy anything. The Skill is in `skills/ioy-saas`; `agents/openai.yaml` supplies its Codex display metadata. Publish product API Skills from each generated product's own OpenAPI, separately from this builder Skill.
