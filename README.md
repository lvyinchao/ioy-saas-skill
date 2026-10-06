# ioy SaaS Skill

An Agent Skill for building an independent Cloudflare AI SaaS using [ioy.ai](https://ioy.ai). Includes an eight-part intake, asset specifications, launch checks, and a bridge to the template's project generator.

**This Skill is public. The SaaS template repository remains private. Sign in to ioy.ai to get a read-only template clone credential; no GitHub account is needed.** Installing the Skill itself does not download template source. The MIT license applies only to files in this public repository; it does not relicense the template or its licensed dependencies/assets.

## 1. Install in Codex

Install Node.js **24.0 or newer** and Git, then run:

```sh
npx --yes skills@1.7.0 add lvyinchao/ioy-saas-skill -s ioy-saas -a codex -g -y
```

This uses the MIT-licensed [Vercel skills CLI](https://github.com/vercel-labs/skills), pinned to the tested installer version. `-s` selects the Skill, `-a codex` selects Codex, `-g` installs globally, and `-y` skips installer prompts. Reopen Codex/start a new session to load the Skill. Other supported agents can use their own `-a` identifier.

The tested installer places this Skill in the shared `~/.agents/skills/ioy-saas` directory supported by Codex. This location is not changed by `CODEX_HOME`. To install only for a project, run the command in that project and omit `-g`. Check discovery with `npx --yes skills@1.7.0 list -a codex -g`.

## 2. Prepare your template

Open [Get the template](https://ioy.ai/app/template), sign in to ioy.ai, and click **Create clone credential**. Your verified account includes read-only access. Run in your own terminal:

```sh
git -c credential.helper= clone https://ioy.ai/template.git ioy-template
```

When Git asks, enter username `ioy` and paste the temporary credential as the password (not your Google password). It expires after one hour, is shown once, and can be revoked on the template page. Creating another credential replaces the old one. Do not paste it into chat, URLs, screenshots or Git. Disabling the credential helper for this command avoids persisting it in Git's credential store.

The URL serves a sanitized release of the private GitHub project through authenticated, read-only Git HTTP. It does not grant write access to the original GitHub repository, include its original history/production configuration, or require a GitHub account. Existing GitHub collaborators can still use their authorized repository access. For support, contact **c@ioy.ai**.

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

## Optional Resend email

For verification, password resets or transactional notifications through Resend, ask Codex to use the [Resend integration workflow](skills/ioy-saas/references/resend.md). It covers domain setup, API keys in Secrets, the mail adapter and delivery checks. Template 1.3.0 includes Cloudflare and Resend adapters. Select emailProvider, configure your independent domain/Secrets, and verify acceptance and delivery. Installing Skills alone does not configure email delivery.

```sh
npx skills add resend/resend-skills
```

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

1. 准备 Node.js 24 LTS+、Git。登录 [ioy.ai 领取页](https://ioy.ai/app/template)，创建一小时有效的只读 clone 凭证；无需 GitHub 账号。按上面的 clone 命令下载，用户名填 `ioy`，密码填临时凭证，不是 Google 密码。
2. 运行上面的一行安装命令，然后重新打开 Codex 或开始新会话。
3. 输入 `$ioy-saas`，说明产品用途、模板路径和新项目的空目录；Codex 会补齐八类关键需求。
4. Skill 调用本地模板生成独立项目。按生成项目的 README 安装依赖、初始化本地密钥和数据库，启动并检查页面及实际结果。
5. 在环境变量或 Cloudflare Secrets 中配置自己的 Google、邮件、模型、支付和分析服务，完成测试环境验收后再发布。不要把 key 写进聊天、需求文件、Skill 或 Git。

模板参数、服务 key、回调地址和部署步骤见[配置文档](https://ioy.ai/docs/configuration)。安装 Skill 后通过 ioy.ai 登录领取私有模板副本，再生成独立产品；安装不等于完成生产上线。公开仓库不包含模板源码、生产资源 ID、运行数据、密钥或模板 Git 历史。临时 clone 凭证也不要粘贴到聊天或写入文件。

## Validate this package

```sh
npm test
```

Tests use isolated temporary fixtures and do not contact providers or deploy anything. The Skill is in `skills/ioy-saas`; `agents/openai.yaml` supplies its Codex display metadata. Publish product API Skills from each generated product's own OpenAPI, separately from this builder Skill.

## Automatic sitemap maintenance

Generated projects include `/sitemap` and `/sitemap.xml`, both driven by `app/core/public-pages.ts`. Published Markdown/MDX enters automatically on content build; edited update dates, removed files, drafts and noindex flags update the inventory. Add simple code pages once in `app/core/policies.ts` or register custom React views in `staticPublicPages()` with their route implementation. Run `npm run content:build` and `npm run sitemap:check`; production builds run both. See the Skill [content workflow](skills/ioy-saas/references/content.md) and [website guide](https://ioy.ai/docs/sitemap). This requires template 1.1.1 or newer.

## One-page SaaS

支持围绕新词或单个需求创建极简工具。需求设 `layout: "one-page"`，只启用一个模块；输入、结果、账户、定价、About、Contact 和政策留在首页。参考 [单页工作流](skills/ioy-saas/references/one-page.md)，实施由授权的模板生成器提供。密钥仍只在环境/Secrets 中配置。


Version 1.3.0 requires template 1.3.0+ and Node 24 LTS. `--check` reads the release capability manifest and requirements schema, checks compatible layouts/providers, and never infers launch readiness. Non-secret settings use launch-config.json; provider keys stay in Secrets. SDK and product Skill operations are generated from OpenAPI. Recovery queries existing tasks/orders, with no automatic duplicate paid requests.
