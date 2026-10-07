# 最优上线顺序与恢复

用户要求自动上线或引导接入时，使用这一分支。复用现有授权和已回答的需求；先检查现状，再执行缺失步骤。仅加载当前供应商的参考资料。模板 1.3.1+ 提供下列辅助命令；老模板先检查版本/差异，不能假定脚本已存在。

## 先确定目标，再执行

记录非敏感选择：新项目目录、正式 origin、Cloudflare account/zone/Worker、Google 账号/Cloud Project/Analytics account、支付供应商和 test/live、时区、货币。放在 launch-config.json；权限或身份不唯一时一次收集缺失选择。密钥、OAuth token、ADC、支付响应和授权截图不进聊天、需求、Skill、Git。账号持有人在本机登录/授权，代理继续执行可自动化工作。

1. **本地完成真实业务**：生成独立项目、修改实际功能/定价/政策，npm ci、db:local、check，检查实际输入和输出。先读 release-manifest.json；不复制模板生产资源。
2. **生成执行与商品清单**：`npm run launch:plan -- --config wrangler.jsonc --provider <waffo|creem|stripe> --billing-env test`。output/launch/plan.json 包含顺序、回调、商品金额/周期、稳定 SKU、幂等键和待绑定 ID。只含允许的配置字段；不是执行成功记录。
3. **Cloudflare**：按 [cloudflare.md](cloudflare.md) 选择账号、建独立资源、迁移、发布 preview，并绑定正式域名。种子发布保留 AI_MODE/BILLING_MODE=disabled，不承诺可付费或可生成。APP_ENV=preview 允许先准备正式域名；正式生产仍经过完整 doctor，不用 website 参数绕过产品检查。
4. **正式域名门槛**：运行 `npm run launch:verify -- --config wrangler.jsonc`，实时检查 HTTPS 首页、健康接口、同源 sitemap。再执行 Google 和支付接入；旧检查记录不能替代当前检查。
5. **Google**：按 [google.md](google.md) 完成 Auth Platform → GA4 → Search Console。拥有 Google 登录态不代表拥有项目/属性权限或所需 OAuth scopes。优先复用现有服务；API 可用则调用辅助工具，未具备 API 授权则操作已授权浏览器控制台，并给出账号持有人需完成的步骤。
6. **邮件、Turnstile、模型**：采用已选服务，不重新询问已定选项；Resend 走 resend.md。确认验证码/重置送达、正式 hostname、真实模型结果和成本出处。发布新生成工具必须完成这一步。
7. **选定支付**：只读取 [payments.md](payments.md) 及对应 provider 分支，先沙箱契约/交易再 live 商品/回调，配置明确映射。已有真实支付上线授权不重复询问；未授权的真实购买、退款、账号条款或商品生产发布不擅自执行。
8. **最终生产**：doctor --release、生产迁移/备份、守卫部署、deploy:verify。配置好一个服务即复查并部署对应配置；全部必需能力通过验收才宣称 SaaS 上线。GA4 配置默认启动，保留既有 DNT/GPC 和敏感数据过滤。
9. **交付**：更新 API/OpenAPI/SDK/产品 Skill，报告部署版本、域名、资源和商品 ID（只列非敏感项）、测试与待验收项目。提交/推送/部署分别说明。

## 自动与用户操作的边界

- CLI/API/已授权控制台内可逆配置直接执行；既有授权不重复确认。
- 必须由用户处理的条件：账号不唯一、权限缺失、域名注册商/NS 转移、2FA/CAPTCHA、KYC、经营者/税务事实、平台条款确认。明确具体入口、需填写的非敏感字段与下一步，不笼统要求“先配置完再来”。继续不依赖该条件的工作。
- Google 登录客户端通过 Auth Platform 控制台创建；不能把 gcloud IAM OAuth clients/IAP clients 当成网站 Google Sign-In 客户端。Google API 不可用时可走 UI，不声称账号登录后“一键全权”。
- 创建资源/商品前查询所有分页；按账号、环境、稳定 SKU、价格、币种和周期匹配。名称相同不足以证明同一商品。多匹配交用户选择，零匹配才创建。
- 保存 output/launch 检查点（Git 忽略、0600）；仅保存允许的 ID、时间、状态，不能 dump 原始响应。超时/断线先回查；保留原幂等键。GA4 创建工具在写入前记录未知状态，不能删状态文件来强行重试。价格变更创建新的价格/版本，历史购买快照保留。
- 域名被旧站占用时列出原 Worker/DNS 并做迁移方案；取得对应迁移授权后处理，不自动删除记录或接管服务。
- 中断后重新读取实际账号、配置和远端状态，执行第一个未完成步骤；终止运行不代表回滚成功。
