# Waffo Pancake：官方 Skill + 当前 SDK

使用 [官方 Waffo Skill](https://docs.waffo.ai/integrate/skill)。官方提供标准 SKILL.md；可下载到本机 Skills 目录后读取当前 store/product/webhook 分支。没有核实的通用 Waffo CLI 时用 SDK；不能编造 `npx waffo`。

模板安装 @waffo/pancake-ts 0.25.0，执行前读取该版本 dist/index.d.ts/docs，官方示例与本版不同时以安装版真实签名为准。服务端使用 merchantId、RSA privateKey，environment 为 **test/prod**（模板 BILLING_MODE 则 test/live）。商户/store 多个时先选择；从 stores GraphQL 查询分页与真实权限，不猜 ID。

## 店铺与商品

store=0 才创建；一个已有 store 可复用；多个需要用户选择。密钥通过本机环境注入，不在 scratch 脚本/参数/返回日志中写入。最小执行形态：

```js
import { WaffoPancake } from "@waffo/pancake-ts";
const client = new WaffoPancake({
  merchantId: process.env.WAFFO_MERCHANT_ID,
  privateKey: process.env.WAFFO_PRIVATE_KEY,
  environment: "test",
});
// 先查询已存在商品，按 metadata.sku、环境、USD金额、周期匹配。
const { product } = await client.subscriptionProducts.create(
  {
    storeId: selectedStoreId,
    name: catalog.name,
    description: catalog.description,
    billingPeriod: catalog.interval === "year" ? "yearly" : "monthly",
    prices: {
      USD: {
        amount: catalog.amountDisplay,
        taxIncluded: selectedTaxIncluded,
        taxCategory: "saas",
      },
    },
    metadata: { sku: catalog.sku },
  },
  { idempotencyKey: catalog.idempotencyKey },
);
// 只记录 product.id 等允许字段，不打印整个响应。
```

once pack 用 client.onetimeProducts.create，不带 billingPeriod。amountDisplay 是 "19.00" 等显示金额，不能传 1900 cents。metadata SKU 复用稳定值；taxIncluded 来自经营者的计费规则。发生 unknown 保留幂等键并回查，不能删除本地意图再创建。

模板使用 WAFFO_MERCHANT_ID、WAFFO_PRIVATE_KEY、WAFFO_STORE_ID、WAFFO_WEBHOOK_PUBLIC_KEY，均经 Secrets 安全传递；RSA key 不写浏览器。商品值绑定 **product ID**。test/live 映射分开，购买快照不覆写。

## 回调与生产上架

通过 GraphQL Store.storeWebhooks 查询已有 endpoint；本版没有 webhooks.list()。使用 client.webhooks.add({ storeId, channel:'http', url:origin+'/api/webhooks/waffo', events:[...], testMode:true }, {idempotencyKey}) 创建 test endpoint，已有匹配则复用/增补必要事件。

订阅/支付事件涵盖 order.completed、subscription.activated/payment_succeeded/past_due/canceling/uncanceled/canceled/plan_changed、refund.succeeded/failed；核对当前模板 Waffo 适配器的实际处理。保持原始 body、RSA 验签、模式检查、流水持久化；官方通用示例不能覆盖模板的持久化/幂等/乱序保护。

创建 test 商品不等于生产上架。经沙箱与既有 live 发布授权后调用相应 namespace `.publish({ id }, {idempotencyKey})` 发布生产版本，再用 prod 环境回读 active 商品/价格/周期/归属。publish 是单向的，不为了测试调用。prod webhook 使用 testMode:false、prod key/public key；不得覆盖 test 配置。商户 prodEnabled/KYB 需平台实际批准，否则保留 BILLING_MODE=disabled 并报告具体控制台阻碍。

本版 GraphQL schema 由实际 introspection/官方文档核对；不能盲猜 renewal 或 receipt 字段。unknown 付款仍按原始 order/checkout 回查，不为验收重复扣款。
