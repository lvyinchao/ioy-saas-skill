# Product intake / 产品需求

Reuse answers already supplied. Ask a small group of missing questions at a time.

1. **Positioning / 定位**: audience, problem, product name, a useful outcome.
2. **Workflow / 工作流**: steps to the first result, history, export, failure recovery.
3. **Inputs and outputs / 输入输出**: text, images, audio, file types and limits. Current reference modules are text/image/audio; other workflows need implementation.
4. **Models / 模型**: provider, model, rights to commercial use, expected cost and daily spending cap. Ask for configuration names, never actual keys.
5. **Billing / 计费**: trial, monthly/yearly subscriptions, top-ups, credit units, limits and refunds. Default adapter: Waffo; Stripe and Creem are alternatives requiring their own setup.
6. **API / 开放接口**: whether enabled, scopes, rate limits, idempotency, product API Skill.
7. **Brand / 品牌**: style, colors, themes, asset preferences, language. English-first; current language examples include zh/ar. Translations require actual published content.
8. **Operations / 上线信息**: domain, support email, data retention/deletion, Cloudflare ownership and required service readiness.

Defaults: Cloudflare React Router SSR, Workers, D1, R2, Workflows; subscriptions plus credits; file-based docs and Blog. Verify supported fields against the installed template. Save non-secret answers in a requirements file. Service keys belong in ignored environment files or Cloudflare Secrets.
