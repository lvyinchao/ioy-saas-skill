# Stripe：官方 Skill 与 CLI

读取已安装 stripe-best-practices、stripe-docs 的相应分支；文档优先 `stripe docs`，缺少该能力时使用官方 docs.stripe.com。客户端使用现有 template adapter，不重写付款流水。先核对 `stripe --version` 与各子命令 --help；升级安装使用官方途径。

## 账号与商品

复用本机登录，否则 `stripe login`；选定实际账号，`stripe whoami` 核对 test/live。默认 CLI 是 test，live 使用 --live；自动化 CLI 读取 STRIPE_API_KEY，应用 Secret 名为 STRIPE_SECRET_KEY，两者不混淆。不要把 key 放 --api-key 参数或工具输出。

先列商品/价格并查询所有页，以稳定 SKU metadata 与 price lookup_key、amount/currency/recurring interval 匹配。不凭显示名选商品；不能把 test ID 绑定 live。清单来自 launch:plan。

```sh
# 示例值来自清单；通过参数数组调用，保留 metadata 字符，不在 shell 插入未经转义文本。
stripe products create --name '<plan-name>' -d 'metadata[ioy_sku]=<sku>' --idempotency '<stable-key>:product'
stripe prices create --product '<product-id>' --currency usd --unit-amount <amountMinor> \
  -d 'recurring[interval]=month' -d 'lookup_key=<stable-price-key>' --idempotency '<stable-key>:price'
```

year 按清单改 interval；pack 不发送 recurring。绑定返回的 **price ID**。两次创建分别有稳定幂等键，出现 unknown 先按 metadata/lookup_key 回查；Stripe 幂等有时间窗口，过期不能假定可无限安全重放。已使用价格不改金额，新增 price 后绑定新 SKU 版本。

## 回调和安全写入

查询已存在 endpoints，复用 URL/环境唯一匹配。创建时订阅当前 adapter 支持的事件：checkout.session.completed、checkout.session.async_payment_succeeded、checkout.session.async_payment_failed、invoice.paid、invoice.payment_failed、customer.subscription.created/updated/deleted、charge.refunded、charge.dispute.created。核对当前 Stripe event/API version 与 adapter。

```sh
stripe webhook_endpoints create --url 'https://app.your-domain.com/api/webhooks/stripe' \
  --enabled-events checkout.session.completed --enabled-events invoice.paid \
  --enabled-events invoice.payment_failed --enabled-events customer.subscription.updated \
  --enabled-events customer.subscription.deleted --enabled-events charge.refunded \
  --enabled-events charge.dispute.created --idempotency '<stable-endpoint-key>'
```

上例按实际 adapter 补齐 created 和异步事件。捕获 JSON 响应 secret，在内存直接传至 Wrangler stdin，不能打印完整 JSON；已有 endpoint 不会再次返回旧 secret，可在控制台轮换/安全复制。写入 STRIPE_SECRET_KEY、STRIPE_WEBHOOK_SECRET。对所有 live 命令添加 --live 并验证账号，不能假定商品自动从 test 迁移。

沙箱验证付款、订阅、幂等/乱序、失败/取消/退款/回查与 D1 权益；仅 sandbox 测试夹具自动触发。本地 `stripe listen` 会输出 secret，应安全捕获而非转发整段终端日志。生产投产先商户资料与收款状态，真实付费测试需相应授权。
