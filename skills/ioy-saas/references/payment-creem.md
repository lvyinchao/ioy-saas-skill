# Creem：官方 Skill / CLI

优先已安装 Creem Skill；否则读取官方入口 [AI integration](https://docs.creem.io/ai/introduction) 指向的 https://creem.io/SKILL.md。无法获取 Skill 时使用已核实的 [官方 CLI](https://docs.creem.io/code/cli)，不伪称安装完成。

```sh
npx --yes @creem_io/cli@0.9.0 --help
npx --yes @creem_io/cli@0.9.0 login
npx --yes @creem_io/cli@0.9.0 whoami --json
npx --yes @creem_io/cli@0.9.0 products list --all --json
```

0.9.0 是本次核对的版本；执行前复核当前官方版本/帮助，更新版本后记录。login 使用本机 masked prompt；自动化可用环境 CREEM_API_KEY。不要使用显式 --api-key 值。key 决定 test/live，--environment test|live 必须一致。产品/回调原始 JSON 捕获后仅输出允许的非敏感字段。

## 商品和映射

从 plan.json 提取 SKU、name、description、amountMinor、currency、interval/kind，先按远端商品 ID/环境/金额/周期 read-back。新商品参考当前 CLI help，可用 --data @output/launch/creem-product.json；其字段是当前 CLI 接受的 camelCase，先验证帮助，不凭旧 REST snake_case 猜测。plan.json 中的 creationInput 已按本次核对的 0.9.0 格式生成：price 为 cents、billingType=recurring/onetime、billingPeriod=every-month/every-year/once；写为商品 JSON 后使用 --data。

```sh
npx --yes @creem_io/cli@0.9.0 products create \
  --data @output/launch/creem-product.json --idempotency-key '<stable-key>' --environment test --json
npx --yes @creem_io/cli@0.9.0 products get '<product-id>' --environment test --json
```

也可通过 --name、--description、--price（USD cents）、--currency、--billing-type、--billing-period 参数；recurring 和 onetime 的枚举以当前 --help 为准，不混用 --data 与 body flags。year/月与一次性 pack 分别创建。税务选项需真实经营者信息。绑定 **product ID** 到 product.prices['test:<plan-id>'].creem。live 用对应 live key 重新查询/创建，不能沿用 test ID。

## 回调和上线

先 webhooks list --all --json，选择当前 origin/api/webhooks/creem 的 HTTP endpoint（不是 CLI delivery mode）。events 包含 checkout.completed、subscription.active/paid/updated/past_due/canceled/expired、refund.created、dispute.created；以当前官方事件和 template adapter 实际映射复核，不订阅虚构事件。

```sh
npx --yes @creem_io/cli@0.9.0 webhooks create --help
npx --yes @creem_io/cli@0.9.0 webhooks create \
  --url 'https://app.your-domain.com/api/webhooks/creem' --name '<product>-test' \
  --delivery-mode http --event checkout.completed --event subscription.paid \
  --event subscription.canceled --event refund.created --event dispute.created \
  --environment test --json
# 依据实际订阅契约补齐 active/updated/past_due/expired，再 get 回读。
npx --yes @creem_io/cli@0.9.0 webhooks get '<webhook-id>' --environment test --json
```

`webhooks secret <id>` 的 stdout 只能内部捕获，经 launch:secret stdin 写 CREEM_WEBHOOK_SECRET；应用 CREEM_API_KEY 同环境配置。listen --forward-to 的启动日志包含 secret，同样捕获，不放进聊天。sandbox 实测 checkout、签名回调、订阅生命周期、退款与权益；live 商品可用性、商户 review/KYC、可收款/可提现分别核对。官方 CLI 未覆盖的审核/主体字段通过用户已授权控制台引导完成。
