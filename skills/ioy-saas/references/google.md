# Google：正式 HTTPS 后配置登录、GA4、Search Console

开始前实时运行 launch:verify，并回查 Cloudflare hostname 对应本次 Worker。收集非敏感选择：Google 账号、Cloud project、Analytics account、属性时区/货币，复用已有答案。账号密码/token 不进聊天；让用户在自己的浏览器完成登录/授权。由 agent 继续在已授权控制台配置，遇到 2FA/CAPTCHA 或权限不足才明确交给持有人。

## 1. Google Cloud Auth Platform（客户登录）

进入 [Google Cloud Console](https://console.cloud.google.com/auth/overview)，选择已授权项目。检查是否已有与当前正式域名对应的 Web application OAuth client；不要跨项目复制已有产品的凭据。

- Branding：产品真实名称、支持邮箱、开发者联系方式、正式首页、隐私与条款地址及授权域名。one-page 使用实际页内政策入口，保证公开可读；如 Google 不接受 hash 链接则保留模板已有独立政策 URL。
- Audience：对公开消费者使用 External；测试时添加指定测试账号，投产按平台要求发布应用。域名归属/品牌审核尚未完成时如实记录。
- 客户登录 scopes 仅 openid、email、profile。不要将运营者的 analytics.edit/webmasters/siteverification 权限请求发给普通用户。
- Clients → Web application：JavaScript origin 精确为 origin（无路径）；Redirect URI 精确为 `origin/api/auth/callback/google`，不能加语言前缀或仅填首页。
- 复用同一 Client ID 实现 OAuth 和 One Tap。下载客户端 JSON 到本机被忽略的 output/launch/google-client.json，chmod 600；不要把 secret 放聊天或配置 vars。

```sh
npm run launch:secret -- --name GOOGLE_CLIENT_ID --file output/launch/google-client.json --json-field web.client_id --config wrangler.jsonc
npm run launch:secret -- --name GOOGLE_CLIENT_SECRET --file output/launch/google-client.json --json-field web.client_secret --config wrangler.jsonc
```

配置 Turnstile 的正式 hostname、Site Key/Secret 后部署。仅模板展示站需 WEBSITE_GOOGLE_AUTH=true；生成 SaaS 使用正常应用 profile。必须在真实浏览器验证 OAuth 回调、新会话、One Tap 服务端校验、取消登录与安全绑定。Google/浏览器的 FedCM、登录态和用户选择可能使 One Tap 不自动显示；不能保证每次静默登录。

没有通用 GA4/GSC 账号 token 能创建这种 OAuth Web 客户端的 API。不要使用 IAM oauth-clients 或 IAP OAuth client 命令来伪造 Google 登录集成；通过控制台配置并安全读取 JSON 是正常自动化分支。

## 2. 运营者授权（API 优先，UI 兜底）

用户只有 Google 登录态时，先在已授权浏览器创建/复用 Analytics account/property/web stream，再在 Search Console 做 DNS 验证和提交 sitemap；把公开 Measurement ID / property ID 写配置。支持 agent 操作控制台，不要求用户自行完成所有配置。

已有足够 API 授权时可用下面工具。gcloud auth login 与 Application Default Credentials 是两种凭据；默认 ADC 不含 Analytics/站点验证 scopes。用已有授权的本机 token（GOOGLE_SETUP_ACCESS_TOKEN 环境变量，不打印）或 **独立** CLOUDSDK_CONFIG，不能覆写用户其他项目的 ADC。首次自动化需在同一所选 Cloud project 启用 Analytics Admin/Data、Search Console、Site Verification API，并准备运营者 OAuth Desktop client（不是客户 Web client）：

```sh
# 本机安全目录保存 operator-client.json，先创建目录并 chmod 700，文件 chmod 600。
# CLOUDSDK_CONFIG 仅作用本命令；不改变全局默认凭据。
CLOUDSDK_CONFIG="$PWD/output/launch/gcloud" gcloud auth application-default login \
  --client-id-file=output/launch/operator-client.json \
  --scopes=openid,https://www.googleapis.com/auth/userinfo.email,https://www.googleapis.com/auth/analytics.edit,https://www.googleapis.com/auth/webmasters,https://www.googleapis.com/auth/siteverification
```

账号还须拥有 Analytics account Editor/Administrator、所选 Cloud project 的相应管理权限，以及域名验证权限。OAuth scopes 不等于账号角色。Cloud API 启用可通过控制台；若用 gcloud services enable，需另外的 Cloud project 授权，不把它强加到网站用户登录。仅缺某一权限时改走该服务 UI；不要求用户重新提交账号密码。

## 3. GA4 自动建立/复用

```sh
npm run google:setup -- --apply --ga4 --config wrangler.jsonc \
  --account accounts/<analytics-account-id> --timezone Asia/Shanghai --currency USD \
  --gcloud-config output/launch/gcloud
```

已有属性可加 --property properties/<id>，工具检查账号归属。工具按账号、属性名称/时区/币种、Web stream origin 查询分页，复用唯一匹配，再创建缺失资源。创建前持久化意图；超时后回查匹配资源，不盲重试。多匹配显式选择，不通过删本地状态规避。运行锁防止同一目标并发执行；崩溃后先确认原 PID 已停止，仅移除遗留 .lock，保留 .json 意图记录。明确的权限/参数拒绝可修复后恢复，断线/5xx/冲突保持未知并回查。

仅把 GA4_ID、GA4_PROPERTY_ID 写入指定 Wrangler 配置；JSONC 会规范化为 JSON，其他配置保持。重新部署后默认启动 GA4，继续尊重 DNT/GPC、关闭广告信号、过滤敏感参数。核对 Realtime/DebugView；collect 204 是接收证据，不等于报表出现。

后台 Data API 另建最小权限服务账号，在属性授予 Viewer；下载受保护 JSON，通过 launch:secret 的 --json-field client_email/private_key 配置 GA4_SERVICE_ACCOUNT_EMAIL/GA4_PRIVATE_KEY。不部署运营者 ADC/access/refresh token 到 Worker。

## 4. Search Console 自动验证和提交

```sh
npm run google:setup -- --apply --search-console --config wrangler.jsonc \
  --zone <cloudflare-zone-id> --gcloud-config output/launch/gcloud
```

需要 Cloudflare token 对所选 zone 有 DNS Read/Edit（仅 Wrangler 登录未必包含），通过本机环境 CLOUDFLARE_API_TOKEN 注入；缺权限时 Skill 在已授权控制台追加记录，不要求把 token 发到聊天。工具先核对 active zone/account 与 hostname，再取 DNS_TXT verification token，以单独 TXT 追加记录，保留 SPF/DKIM/其他验证记录。通过 Site Verification 完成归属，再添加 `sc-domain:<host>` 并提交 `origin/sitemap.xml`；读取提交状态。DNS 尚未传播时在检查点停止，等待/检查后复用 TXT 再运行，不删除验证记录。站点已提交不表示已收录；URL Inspection/覆盖率后续另验。

Google 工具不会自动设置 Search Console 域名到其他产品，不会提交 indexing API 伪造普通页面加速收录。配置/沙箱/生产/收录状态分别记录。

官方依据：[OAuth Web client](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid)、[独立 ADC 与 scopes](https://docs.cloud.google.com/sdk/gcloud/reference/auth/application-default/login)、[GA4 创建](https://developers.google.com/analytics/devguides/config/admin/v1/rest/v1beta/properties/create)、[DNS 站点验证](https://developers.google.com/site-verification/v1/webResource/insert)、[sitemap 提交](https://developers.google.com/webmaster-tools/v1/sitemaps/submit)。
