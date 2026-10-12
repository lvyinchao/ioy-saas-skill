# ioy CLI：创建、检查、上线与恢复

从已领取的干净母版使用 Node 24+、`npm ci`，准备八类需求。标准示例 `examples/requirements.json`，单页示例 `examples/one-page.json`。模板免费，外部服务单独计费。

```sh
npm run ioy -- create --config examples/requirements.json --out ../my-product
cd ../my-product
npm ci
npm run ioy -- doctor
npm run ioy -- launch
npm run ioy -- status
npm run ioy -- resume
```

`create` 不修改来源、拒绝非空输出，并生成独立 Git 工作树；可显式传 `--github owner/name` 创建私有 GitHub 仓库并推送。未传时不创建外部仓库。`doctor` 检查本机工具、GitHub 登录、选择及配置，并对已选择的 Cloudflare 账号/zone/DNS 做只读权限检查；写入权限通过上线阶段的 API/CLI 请求检查，不能从“已登录”推断所有权限。

## 配置和进度

`launch/resume/status` 的 `--config` 默认 `launch-config.json`，不是 Wrangler 配置。`wranglerConfig` 默认 `wrangler.jsonc`；`productionConfig` 为独立生产配置。Cloudflare account 在 Wrangler 的 account_id，`cloudflare.zoneId` 为已激活域名 zone。`google.analyticsAccount` 使用 accounts/<id>，timeZone 默认 UTC、currency 默认 USD。用户本机授权，Secrets 通过既有 `launch:secret` 转移。不得填写 token、password、apiKey 等密钥字段。

本地检查 → 独立 D1/R2 资源 → preview → 正式域名 HTTPS → Google → 邮件/模型 → 支付 → 生产 → 实测。未知远端创建先按账号/名称/ID 回查；不重复调用。D1 分页和 R2 cursor 分页都完成后才判断资源缺失；已有明确 ID 不自动替换。

检查点以产品、账号、Worker 和 origin 区分，位于 Git 忽略的 output/launch，0600 文件；并发锁记录 PID。中断后确认进程已停止才移除锁，不删除 journal。CLI 不上传遥测。源码指纹变化后重跑本地验收；进入生产部署后 resume 不回放 preview。

## 人工与供应商验收

Google Web OAuth 客户端、权限/2FA/商户审核按现有 Skill 分支指导；已授权可自动化的 GA4/Search Console 请求使用既有脚本。支付商品由所选 provider Skill/CLI 创建、回查和绑定，不伪造统一的商品创建 API。检查输出明确为 blocked/pending，配置成功不等于交易成功。

`verification` 记录 google、services、sandbox、paymentLive、production；每条为 `{status: "verified", origin: "https://your-domain", templateVersion: "1.4.0", checkedAt: "ISO timestamp", evidence: "output/.../receipt.json"}`。记录指向实际存在且非空的本机证据，不包含密钥；未来时间与过期记录不能通过。正式 SaaS 需要当前 origin/版本且24小时内的记录；状态输出只显示验收状态，不回显自由字段。

生产先检查域名归属、独立 DB/桶与 origin，备份明确生产配置的 D1，再迁移与守卫部署。CLI 完成公共 URL 检查后，仍需要真实登录/邮件/AI/支付/分析验收记录。母版 website 不走生成产品的 CLI launch，而继续使用原守卫部署流程，AI/支付维持 disabled。
