# ioy SaaS Skill

[![skills.sh](https://skills.sh/b/lvyinchao/ioy-saas-skill)](https://skills.sh/lvyinchao/ioy-saas-skill)

An Agent Skill for building an independent Cloudflare AI SaaS using [ioy.ai](https://ioy.ai). Includes an eight-part intake, asset specifications, launch checks, and a bridge to the template's project generator.

**The starter template is free after signing in at [https://ioy.ai](https://ioy.ai).** Sign in with your Google account to access the read-only template clone credential immediately—no payment required.

**This Skill is public. The SaaS template repository remains private. Sign in to ioy.ai to get a read-only template clone credential; no GitHub account is needed.** Installing the Skill itself does not download template source. The MIT license applies only to files in this public repository; it does not relicense the template or its licensed dependencies/assets.

## 1. Install in Codex

Install Node.js **22.20 or newer** and Git for the Skill installer; use **24.0 or newer** when building the template, then run:

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

Install the template's dependencies once before using its generator. This uses Node 24+; it prepares ignored dependencies and reference assets, without connecting any provider:

```sh
cd ioy-template
npm ci
```

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

1. 准备 Node.js 22.20+（Skill 安装器）、Node.js 24+（模板构建）和 Git。登录 [ioy.ai 领取页](https://ioy.ai/app/template)，创建一小时有效的只读 clone 凭证；无需 GitHub 账号。按上面的 clone 命令下载，用户名填 `ioy`，密码填临时凭证，不是 Google 密码。
2. 运行上面的一行安装命令，然后重新打开 Codex 或开始新会话。
3. 在新下载的模板目录运行 `npm ci` 安装生成器依赖，再输入 `$ioy-saas`，说明产品用途、模板路径和新项目的空目录；Codex 会补齐八类关键需求。
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


Version 1.5.0 supports older compatible generators; the shared launch coordinator requires template 1.4.0+ and Node 24+, while expanded capability presets require template 1.5.0+. `--check` reads the release capability manifest and requirements schema, checks compatible layouts/providers, and never infers launch readiness. Non-secret settings use launch-config.json; provider keys stay in Secrets. SDK and product Skill operations are generated from OpenAPI. Recovery queries existing tasks/orders, with no automatic duplicate paid requests.

## Guided or automated launch / 自动接入

Ask Codex: `Use $ioy-saas to deploy my product on Cloudflare, bind my formal domain, configure Google login/One Tap, GA4 and Search Console, then set up my selected payment provider. Guide me only where account ownership or platform checks require me.`

最佳顺序是本地业务验收 → Cloudflare 独立资源和 preview → 正式域名/HTTPS → Google 登录、GA4、Search Console → 邮件/Turnstile/模型 → 所选支付沙箱与 live 商品 → 生产检查、部署、实测。见 [上线编排](skills/ioy-saas/references/orchestration.md)，仅加载当前供应商分支。模板 1.3.1+ 包含执行/商品清单、域名验证、Cloudflare 发布绑定、安全写入密钥、GA4 与 Search Console 接入工具；辅助工具位于私有模板，不在公开 Skill 中包含模板源码。

Google 账号登录后由 Codex 继续引导或操作已授权控制台；API 分支另需正确 scopes 与项目/属性权限。Google 网站 OAuth 客户端通过 Auth Platform 配置；运营者授权不会下发给产品用户。Stripe/Creem 用官方 CLI，Waffo 用官方 Skill/SDK，先查询复用，再创建缺失商品。KYC、2FA、账号选择、真实税务事实和注册商操作交给持有人；配置、沙箱、收款与提现状态分别记录。密钥仅在本机安全输入/环境/Secrets；不要粘贴到聊天。

## Shared first-launch commands (template 1.4.0+)

In your authorized template, use `npm run ioy -- create --config examples/requirements.json --out ../my-product`; use `examples/one-page.json` for a single-page tool. In the generated project, `npm run ioy -- doctor`, `launch`, `resume` and `status` share the same launch choices and checkpoint journal. Read [the coordinator guide](skills/ioy-saas/references/coordinator.md) and [launch checklist](https://ioy.ai/docs/launch-checklist). Brand design uses the bundled `brand-to-ui` Skill.

The template is free after verified sign-in. Your Cloudflare, model, email and payment services have independent costs. Local configuration, sandbox acceptance and production acceptance remain separate. No CLI telemetry is uploaded.

## Template 1.5 capability presets

Use the authorized template's CLI to collect eight groups of requirements or start from a complete preset. Replace example product names, domains and support addresses before publishing.

```sh
npm run ioy -- create --out /absolute/path/new-product
# Or edit a preset and generate from its requirements:
npm run ioy -- create --config presets/research-chat.json --out /absolute/path/new-product
cd /absolute/path/new-product
npm ci
npm run db:local
npm run ioy -- doctor
npm run ioy -- status
```

Available presets are summary-tool, image-studio, voice-tool and research-chat. Template 1.5 also supplies persistent chat, private image editing/captioning, sourced web search, Workers AI/fal adapters, three visual themes and a component gallery. Optional waitlist/newsletter, durable operator notifications, Umami/Plausible/Clarity, Crisp and the paired browser extension remain disabled until the generated product configures them. The template's README and [capability workflow](skills/ioy-saas/references/capabilities.md) explain the exact environment variables and acceptance steps.

`ioy payment` provisions the selected Stripe, Creem or Waffo **sandbox** catalog and webhook using an operation journal and read-back checks. `ioy upgrade` prepares a controlled three-way upgrade from the recorded template baseline. Configuration and fixture tests do not prove real email delivery, payments, model results or production readiness. No provider credential or private source code belongs in this public Skill repository.

中文：先选择完整 SaaS 或单页工具，再使用向导收集八类需求。四套预设、可选邮件增长、通知、分析、客服与浏览器扩展都在领取的模板内；本公开仓库只提供 Skill 和指导。完成本地验收后，使用产品自己的服务账号配置并验证。
