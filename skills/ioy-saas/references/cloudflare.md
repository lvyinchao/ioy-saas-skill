# Cloudflare CLI：账号 → 资源 → 域名 → 发布

先读已安装 cloudflare Skill 的 Workers/Wrangler 分支；按项目锁文件使用本地 Wrangler。新项目使用 Workers + Static Assets，保留当前 SSR、D1/R2/Workflows/DO 架构。

## 1. 本机授权和独立资源

```sh
npx wrangler login
npx wrangler whoami --json
npx wrangler d1 list --json
npx wrangler r2 bucket list
```

复用已有 Wrangler 登录；whoami 显示多个账号时请用户选目标。wrangler.jsonc 设置明确 account_id/name，后续所有命令带 --config。多账号资源创建通过环境 CLOUDFLARE_ACCOUNT_ID 指定所选账号（账号 ID 不是密钥）。按账号/环境/名称查询已有 D1/R2，只在确实不存在时创建：

```sh
npx wrangler d1 create <product>-preview-db --config wrangler.jsonc
npx wrangler r2 bucket create <product>-preview-files --config wrangler.jsonc
```

从回执/回查取 database_id 填入 DB，FILES bucket_name 指向独立桶；保留迁移、Workflows 类及 SQLite DO 绑定。支持的付费计划、Email Sending、R2 需在控制台开通；不能冒充已开通。生产使用另一个独立配置和资源，不能误将 preview 数据当生产。

## 2. 密钥、迁移和 preview

先把生成项目 APP_URL 和 product.domain 设为正式 HTTPS origin；APP_ENV=preview，AI_MODE/BILLING_MODE=disabled。只保留实际可用能力，测试站访问范围由经营者决定。暂时不把未配置服务列为可购买/可生成。

认证密钥用本机安全随机源生成（至少32随机字节），不要在工具输出打印。使用 launch:secret 从环境/受保护文件写入：

```sh
npm run launch:secret -- --name BETTER_AUTH_SECRET --from-env BETTER_AUTH_SECRET --config wrangler.jsonc
npx wrangler d1 migrations apply DB --remote --config wrangler.jsonc
npm run deploy -- --config wrangler.jsonc
```

.env/.dev.vars 只用于本地；部署不自动读取它们。辅助工具也支持 --stdin、--file、--json-field；参数只含变量名/路径。private PEM/下载 JSON 放 output/launch 下并 chmod 600，避免第三方日志、截图或提交暴露。

## 3. 自动绑定正式域名

前提：所选账号拥有 active Cloudflare zone。若 pending，指导用户在注册商替换 NS，保留邮件 DNS，等 zone 激活；域名购买/注册商登录不通过 Wrangler 假造完成。

```sh
npm run cloudflare:launch -- --config wrangler.jsonc --zone <zone-id>
npm run cloudflare:launch -- --config wrangler.jsonc --zone <zone-id> --apply
npm run launch:verify -- --config wrangler.jsonc
```

第一条只读核对账号、zone、既有 Worker domain、DNS、Worker routes。第二条添加 `routes: [{pattern: "app.your-domain.com", custom_domain: true}]`（保留其他路由），经既有守卫部署；Wrangler/Cloudflare 管理 DNS 与 TLS。工具拒绝接管另一 Worker、既有 A/AAAA/CNAME 和匹配旧 Worker 的路由；迁移需另外有对应授权。只支持独立平铺配置，named env/旧 route 须明确整理后使用。凭据优先读 CLOUDFLARE_API_TOKEN，否则在内存捕获 Wrangler OAuth token；不输出、不保存，不使用 Global API Key。域名预检还需所选 zone 的 DNS Read 与 Worker/routes 读取权限；TXT 自动写入另需 DNS Edit。Wrangler OAuth 能部署不一定有 DNS API 权限（例如预检返回 DNS 403 时工具不会继续绑定）；权限不足时在 Cloudflare 控制台创建仅覆盖所选账号/zone 的 API token，通过本机环境注入，或由已授权控制台核查 DNS 并走现有 Wrangler 流程。不打印 token、不索取 Global API Key。

若 DNS/TLS 尚未就绪，保留已部署版本，检查 Cloudflare 域名状态和 DNS 后重新 launch:verify；不因健康检查失败创建另一个 Worker。200 页还须属于这次绑定的 Worker；回查 domain 的 service 与配置 name 一致。HTTPS/health/sitemap 通过后执行 Google 分支。

## 4. 正式投产

各服务完成沙箱验收后准备 production 配置，APP_ENV=production，正确绑定真实成本和 live 商品；先备份独立 D1，应用兼容迁移。

```sh
npm run doctor -- --release --config wrangler.production.jsonc
npm run cloudflare:launch -- --config wrangler.production.jsonc --zone <zone-id> --apply --production
npm run deploy:verify -- --url https://app.your-domain.com
```

website 选项仅供 template/website 展示站，不用于绕过生成 SaaS 的登录、邮件、模型或支付检查。保存部署版本/迁移/恢复记录；回退前检查数据库兼容性。

官方依据：[Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)、[Wrangler 命令](https://developers.cloudflare.com/workers/wrangler/commands/)。
