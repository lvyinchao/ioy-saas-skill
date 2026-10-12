# 选择一种支付：清单 → 沙箱 → live 商品 → 回调 → 真实权益

正式域名验证后，仅加载用户所选 provider：

- [Waffo](payment-waffo.md)：官方 Skill + 当前安装的 @waffo/pancake-ts SDK；不假造 CLI。
- [Creem](payment-creem.md)：官方 Skill/CLI；可通过 npx 使用 CLI。
- [Stripe](payment-stripe.md)：已安装 Stripe Skill + Stripe CLI；没有插件时使用官方 CLI/文档。

先查已安装 Skills/CLI，再安装确实需要的官方工具；检查官方来源与版本，避免把整个供应商 Skill 拷入公开母版。第三方 Skill 的流程需适配当前模板，不直接覆盖已验证的支付流水和安全处理。

1. 在明确的商户账号/store 和 test 环境查询商品/价格/回调（遍历分页），用当前 app/core/product.ts 生成清单：
   `npm run launch:plan -- --config wrangler.jsonc --provider <provider> --billing-env test`。
2. 每个 SKU 核对金额、USD、周期、credits、税务事实和商品归属。模板金额是 USD 整数 cents；Waffo 接口用显示金额字符串，Stripe/Creem 用最小单位。当前辅助清单拒绝非 USD，新增币种须实现完整单位换算与测试。
3. 复用完全匹配的远端 ID；缺失则使用稳定幂等键创建。多个账号/store/商品匹配需选择，未知请求回查，不能以新 key 重做。供应商不支持幂等的操作用本地意图记录与远端回查，超时后停止该分支。
4. 只将允许字段（SKU、环境、ID、金额、周期、状态）记入 output/launch 或 product.prices；不保存原始响应、客户数据、checkout URL 或密钥。解析 CLI JSON 时捕获 stdout，不直接向聊天打印。回调创建返回 signing secret 时直接通过本机内存/安全文件送入 launch:secret。
5. 映射写入 `app/core/payment-catalog.json`，由 `product.prices` 读取：`test:<plan-id>` 下的 `stripe` 值为 price ID，Waffo/Creem 值为 product ID。live 使用独立 `live:<plan-id>`。设置 BILLING_PROVIDER 及同环境 Secrets；BILLING_MODE=test 只用于沙箱，live 在实际完成配置/验收后启用。
6. 回调 URL 精确为 `origin/api/webhooks/<provider>`，无语言前缀。签名原始 body 验证，测试/生产环境严格分开。订阅首付、续费、欠费、取消、到期、退款/争议及一口价支付都需要匹配事件。
7. 先通过本地契约和供应商沙箱支付/签名回调、重复与乱序回调、回查和权益账目；成功页/商品创建/200 响应均不替代支付确认。按已有 live 发布授权创建/激活 live 商品与回调，重新 read-back 价格/周期和 live 可售状态，再运行 doctor/部署。
8. 真实扣款/退款只有对应授权才做；若缺 live 验收，报告已配置/已沙箱/待生产验证，不制造一笔“已成功”付款。退款和争议保持周期终态，不能被迟到回调重新增发额度。

用户需处理 KYC/KYB、主体/税务/收款信息和平台条款时给出具体控制台入口及所缺字段。商品发布不等于账号审核通过、付款通道可用或提现成功。没有用户提供的真实税务注册，不开启自动税收注册。既有用户授权仍有效，不添加重复审批。

## 内置 sandbox provisioning

`npm run ioy -- payment --provider <stripe|creem|waffo> --account <selection> --config wrangler.preview.jsonc` 输出清单；明确 sandbox 配置授权后加 `--apply`。Waffo 额外给 `--store`、`--tax-included true|false`。封装使用各供应商真实 API/CLI/SDK，不伪造统一远端接口。先读分页与检查身份/模式，按 SKU/价格/周期精确复用，逐操作保存意图，POST 后再次 read-back；返回 `configured` 而非交易成功。新秘密只经内存到 Wrangler stdin。统一价格映射写 app/core/payment-catalog.json，原 test/live 购买快照不改动。

发生网络未知结果，保存原 journal，下一次查询原 ID/SKU；未找到也不假定未创建、不重复 POST。已存在 Stripe webhook 需要安全提供其原签名 secret；Creem 通过官方 `webhooks secret` 内部捕获；Waffo继续现有 SDK RSA验证。该分支拒绝生产 Worker 和 live Stripe key，不自动生产上架或测试扣款。完成后部署 preview并运行本页所列交易验收，再按各供应商分支配置 live。完整步骤见授权模板内 `docs/ioy-cli.md` 的“支付沙箱自动配置”章节。
