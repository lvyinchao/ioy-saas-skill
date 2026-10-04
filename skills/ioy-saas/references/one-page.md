# Generate a one-page SaaS

Use this mode for one clearly defined input and result, such as a new-term explainer. Reuse the eight intake areas; select layout as part of workflow, not an extra questionnaire. Keep secrets out of requirements.

1. Use the authorized template's `examples/one-page.json`; set `layout: "one-page"` and exactly one of `text`, `image`, `audio`. Custom business types require an implemented provider and metering.
2. Set independent identity, domain, support email and `onePage` labels: `heading`, `inputLabel`, `placeholder`, `submitLabel`, `resultLabel` (non-empty strings up to 500 characters).
3. Generate into an empty directory outside the template using its normal generator. Follow the generated README and `docs/one-page.md` for install, D1, local run and independent service keys.
4. Inspect desktop/mobile input and output, anonymous → inline account → restored input, email registration/code/reset, Google OAuth and One Tap, quota handling, errors and downloads. Local simulations stay labelled. Google auto-select depends on browser and prior consent.
5. Configure Waffo, Stripe or Creem (one provider per deployment). Check return to `/?order=<id>#pricing`, provider-verified order state, duplicate callback handling and portal/cancellation. Return parameters never grant credits by themselves.
6. Keep About, Contact and policy bodies in SSR expandable sections. Replace reference policies with actual business facts. Root is the canonical sitemap URL; anchors do not create additional entries. Auxiliary docs retain noindex in single-page mode; standard mode restores full public content indexing.
7. Run relevant tests, inspect a freshly generated project and document implementation/local/sandbox/production evidence separately. Do not claim real email, model or payment acceptance without actual provider evidence.

Public Skill contains instructions only. The sanitized private template supplies the implementation. Do not publish source credentials, deployment identifiers or user data.
