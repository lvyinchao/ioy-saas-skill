# Expanded product capabilities

Use the existing schema and coordinator, not a second generator. `ioy create` accepts guided eight-group intake, requirements files and presets. Presets: summary-tool (one-page text), image-studio (generate/edit/caption), voice-tool (one-page TTS), research-chat (conversation/search). Read docs/presets.md. `themePreset` selects paper-ink/midnight/studio-blue; brand overrides remain supported. /components previews actual shared components.

## AI workflows

Supported kinds are text/image/audio/chat/image-edit/image-caption/web-search. Read docs/ai-workflows.md only for the selected workflows. Chat requires a private conversation ID; edit/caption requires an authorized inputAssetId. AI_PROVIDERS_JSON chooses OpenAI-compatible, Workers AI or fal per feature; unsupported combinations must be rejected. Search also needs the configured search provider. Preserve credit reservations, measured model costs, input privacy, immutable context, bounded uploads, source links and unknown-result recovery. Build OpenAPI, SDK and API Skill after contract changes. A model catalog entry is not provider acceptance.

## Growth and operations

Read docs/growth-and-notifications.md when enabled. Waitlist/newsletter use separate explicit opt-in and email confirmation; sign-up does not subscribe. Configure Resend or Beehiiv, independent sending identity, signed delivery webhooks, suppression, unsubscribe and delivery status. Product update/newsletter dispatch requires the user's corresponding recipient/audience and message authorization; preview the concrete audience and content before sending. Do not execute a broadcast simply because the template supports it. Notifications are optional and durable; reference IDs and system amounts may be included, never prompts, keys or user email.

## Optional services and extension

Read docs/optional-integrations.md for Umami/Plausible/Clarity/Crisp. Preserve GA4 behavior and private-data filtering; additional trackers are public-only, no tokens/queries; no automatic identity sharing. Scripts and config are not actual report verification.

Read docs/browser-extension.md for the separate MV3 client. Build it against the generated product origin; allow only its exact extension origin. Pairing requires explicit approval from a verified website session; the device shares account credits through scoped API keys. Test pairing, permissions, logout/revoke, task persistence, private uploads and result download in an isolated profile. Server secrets never enter client artifacts.

## Payment and upgrade

`ioy payment` is a three-provider sandbox provisioner with explicit account selection and `--apply`; inspect the plan first. It creates/reuses products and Webhooks, writes payment-catalog.json and imports secrets through Wrangler stdin. Unknown creation is reconciled before another POST. A populated catalog does not prove a test purchase or merchant production eligibility.

`ioy upgrade --template <clean template>` previews a three-way plan using the generated hash-bound .ioy/template-base. Apply in an independent branch/worktree. Preserve customized code, secrets and production configuration; retain conflict candidates, run migrations locally and validate affected workflows before any authorized production update. Read docs/upgrade.md if present or docs/ioy-cli.md.
