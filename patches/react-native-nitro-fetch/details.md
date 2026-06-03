# react-native-nitro-fetch — certificate pinning patch

## What this patch does

`react-native-nitro-fetch` is the primary `fetch()` implementation (it replaces `globalThis.fetch`
in `src/polyfills/NitroFetch.ts`). On Android it uses **Chromium Cronet**, which has its own BoringSSL
trust stack and does **not** honor `network_security_config.xml`. This patch pins the Cronet engines
directly via `CronetEngine.Builder.addPublicKeyPins()`.

The patch (`patches/react-native-nitro-fetch+1.3.2.patch`) touches three files:

1. **`ExpensifyCertificatePins.kt`** (new) — shared helper that applies public-key pins for every
   Tier 1 + Tier 1b host to a `CronetEngine.Builder`. No-op in debug builds (`BuildConfig.DEBUG`).
2. **`NitroFetch.kt`** — calls `ExpensifyCertificatePins.apply(builder)` in `getEngine()` (the main
   buffered `fetch()` engine) before `builder.build()`.
3. **`NitroCronet.kt`** — same call in `getOrCreateCronetEngine()` (the streaming engine used by
   `fetch(url, { stream: true })`).

Pins must stay in sync with `config/certificatePinning/pins.json`,
`android/app/src/main/res/xml/network_security_config.xml`, `CertificatePinning.kt`, and
`ios/CertificatePinning.swift`. Regenerate hashes with `scripts/generateCertificatePins.sh`.

## iOS

iOS Nitro Fetch goes through `URLSession`, which is covered by the TrustKit
`kTSKSwizzleNetworkDelegates` initialization in `ios/CertificatePinning.swift`. No Nitro patch is
required on iOS.

## AutoPrefetcher token refresh (`HttpURLConnection`)

The cold-start token refresh in `AutoPrefetcher` uses `HttpURLConnection`, which is covered by the
`<pin-set>` in `network_security_config.xml` on API 24+ — no Cronet patch needed for that path.

## Regenerating the patch after a library upgrade

```bash
npm install
# Re-apply the three edits above to node_modules/react-native-nitro-fetch (patch-package will
# attempt this automatically on install; resolve any fuzz manually), then:
npx patch-package react-native-nitro-fetch --include 'NitroFetch\.kt$|NitroCronet\.kt$|ExpensifyCertificatePins\.kt$'
```

## Verification

- Release build: API calls (which go through Cronet) succeed with correct pins.
- Flip one hash to a wrong value and confirm requests fail with `ERR_SSL_PINNED_KEY_NOT_IN_CERT_CHAIN`
  (surfaced to JS and reported via `src/libs/CertificatePinning`).
- Debug build: no pinning, local dev server works.
