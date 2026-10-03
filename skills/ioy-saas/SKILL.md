---
name: ioy-saas
description: Build an independent Cloudflare AI SaaS from an authorized local ioy template. Use when a user asks to start a product with ioy, collect SaaS requirements, customize its starter, or prepare its launch.
---

# ioy SaaS

Use Chinese operator instructions when appropriate; generated product content defaults to English. This public Skill supplies a workflow and generator bridge, not access to the private template.

## Locate the template

Use the user-provided path, `SAAS_TEMPLATE`, or a template in the current directory. Run `node <skill-directory>/scripts/create-project.mjs --template <template-directory> --check`. This checks files, not license entitlement. Read that template's README and `docs/launch.md` for current commands and configuration. If no authorized copy is available, explain the missing prerequisite and ask for its location; do not represent a generic replacement as the ioy template.

## Collect and generate

1. Read [intake.md](references/intake.md). Reuse existing answers and collect only missing requirements. Never request secrets in requirements or chat.
2. Adapt [requirements.json](references/requirements.json) to actual supported modules. Keep service credentials separate. Confirm the output directory is empty and outside the template.
3. Run `node <skill-directory>/scripts/create-project.mjs --template <template-directory> --config <requirements-file> --out <new-project-directory>`.
4. Follow the generated README: install dependencies, initialize local secrets and D1, run relevant checks, start the app, and inspect actual pages and task outputs. Local mail and AI simulations must remain clearly labeled.
5. Personalize product configuration, navigation, feature pages, user docs, Blog, and policy drafts around enabled functionality. Do not invent testimonials, logos, revenue, performance statistics, or legal guarantees.
6. Read [assets.md](references/assets.md) when creating personalized materials. Record prompts, provenance, formats, and missing assets. Capture product screenshots from the running app.

For a new business workflow, update UI, provider integration, metering, API, OpenAPI, product API Skill, and user docs together. Keep the template read-only and the generated project independently runnable.

## Validate and deliver

Read [launch.md](references/launch.md) for preview and production acceptance. Configure independent Cloudflare, Google, email, model, payment, and analytics services through environment variables or Secrets. The builder Skill is separate from the generated product's API Skill.

Preserve unrelated changes and follow the user's existing authorization. Installing this Skill does not authorize production changes, external messages, or public publication. Do not infer success for an unknown task or payment, or blindly repeat paid calls.

Report output path and template version; distinguish implementation, local simulation, sandbox checks, production verification, commit, push, and deployment. State concrete missing external conditions rather than describing a local demo as a launched product.
