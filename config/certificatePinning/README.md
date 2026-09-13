# Certificate Pinning (Iteration 1 — NewDot)

SSL certificate pinning for the NewDot React Native app. Pinning is enforced **natively** in each
HTTP stack; there is no single JS switch because the app's networking is spread across several
native stacks.

## Rollout phases

Pinning ships in **monitor-only** mode first. Pin validation runs on real traffic, mismatches are
reported to Sentry from the native layer, and connections are **not** blocked. After 1-2 weeks of
Sentry data shows ~0 false positives (across OS versions, corporate proxies, cert rotations), flip to
**enforce** mode.

| Phase | `enforcePinning` | Behavior |
|-------|------------------|----------|
| Monitor (current) | `false` | Validate pins, report failures to Sentry, allow connections |
| Enforce | `true` | Block connections on pin mismatch |

To flip to enforce mode, update **all** of:
1. `config/certificatePinning/pins.json` → `"enforcePinning": true`
2. `ios/CertificatePinning.swift` → `enforcePinning = true`
3. `android/.../CertificatePinning.kt` → `ENFORCE_PINNING = true`
4. Replace `network_security_config.xml` with `network_security_config_enforce.xml`
5. **HybridApp only:** `Mobile-Expensify/iOS/Expensify/ExpensifyAppDelegate.m` → `kTSKEnforcePinning: @YES`
6. **HybridApp only:** `Mobile-Expensify/Android/.../ExpensifyCertificatePinner.java` → `ENFORCE_PINNING = true`
7. **HybridApp only:** Replace `Mobile-Expensify/Android/res/xml/network_security_config.xml` with `network_security_config_enforce.xml`

## Where pinning is validated

| Stack | Platform | Mechanism | File |
|-------|----------|-----------|------|
| URLSession (`fetch()`, blob-util, etc.) | iOS | TrustKit URLSession swizzling | `ios/CertificatePinning.swift` |
| URLSession (OldDot + NewDot HybridApp) | iOS | TrustKit URLSession swizzling | `Mobile-Expensify/iOS/Expensify/ExpensifyAppDelegate.m` |
| OkHttp (`fetch()`, blob-util, RN networking) | Android | OkHttp `CertificatePinner` interceptor | `android/app/src/main/java/com/expensify/chat/CertificatePinning.kt` |
| OkHttp (OldDot HybridApp) | Android | OkHttp `CertificatePinner` | `Mobile-Expensify/Android/.../ExpensifyCertificatePinner.java` |
| Fresco (RN Image component) | Android | Uses OkHttp via `OkHttpClientProvider` | (covered by OkHttp row above) |
| HttpURLConnection | Android | Wrapping `HostnameVerifier` (monitor) / `<pin-set>` (enforce) | `CertificatePinning.kt` / `network_security_config_enforce.xml` |
| HttpURLConnection (HybridApp) | Android | Wrapping `HostnameVerifier` (monitor) / `<pin-set>` (enforce) | `ExpensifyCertificatePinner.java` / `network_security_config_enforce.xml` |
| Glide (OldDot/HybridApp) | Android | Via `HttpURLConnection` `HostnameVerifier` (monitor) / `<pin-set>` (enforce) | `ExpensifyCertificatePinner.java` / `network_security_config_enforce.xml` |
| WebView (YAPL OldDot) | Android | SPKI hash check after page load (monitor) / `<pin-set>` (enforce) | `WebViewCertificateMonitor.java` / `network_security_config_enforce.xml` |
| WebView | Android | SPKI hash check after page load (monitor) / `<pin-set>` (enforce) | `WebViewCertificateMonitor.kt` + webview patch / `network_security_config_enforce.xml` |
| WebView (WKWebView) | iOS | TrustKit validator in challenge handler | `patches/react-native-webview+13.16.0+002+certificate-pinning.patch` |
| WebView (OldDot HybridApp) | iOS | TrustKit validator in challenge handler | `Mobile-Expensify/iOS/Expensify/Libraries/YAPL-Cocoa/Elements/YAPLWKWebView.m` |

### Monitor-mode coverage notes

Android's `<pin-set>` in `network_security_config.xml` is binary — it either enforces or is absent.
There is no OS-level monitor-only mode. During the monitor rollout the `<pin-set>` is absent, so
alternative monitors fill the gap:

#### Standalone NewDot

| Android channel | Monitor mode | Enforce mode |
|-----------------|-------------|-------------|
| OkHttp (fetch, blob-util, RN networking) | OkHttp interceptor in `CertificatePinning.kt` | OkHttp `CertificatePinner` + reporting interceptor |
| Fresco (React Native Image) | Via OkHttp (same client from `OkHttpClientProvider`) | Via OkHttp |
| WebView (react-native-webview) | `WebViewCertificateMonitor.kt` (SPKI check of the rebuilt chain, root included, after page load) | `<pin-set>` in `network_security_config_enforce.xml` |
| HttpURLConnection | Wrapping `HostnameVerifier` in `CertificatePinning.kt` | `<pin-set>` in `network_security_config_enforce.xml` |

#### HybridApp (OldDot + NewDot)

| Android channel | Monitor mode | Enforce mode |
|-----------------|-------------|-------------|
| OkHttp (YAPL API, crash reporter) | OkHttp interceptor in `ExpensifyCertificatePinner.java` | OkHttp `CertificatePinner` + reporting interceptor |
| OkHttp (fetch, blob-util, RN networking) | OkHttp interceptor in `CertificatePinning.kt` | OkHttp `CertificatePinner` + reporting interceptor |
| WebView (YAPL OldDot) | `WebViewCertificateMonitor.java` (SPKI check after page load) | `<pin-set>` in `network_security_config_enforce.xml` |
| WebView (react-native-webview) | `WebViewCertificateMonitor` (via patch + reflection) | `<pin-set>` in `network_security_config_enforce.xml` |
| HttpURLConnection (downloads, Pusher) | Wrapping `HostnameVerifier` in `ExpensifyCertificatePinner.java` | `<pin-set>` in `network_security_config_enforce.xml` |
| Glide (image loading) | Via `HttpURLConnection` `HostnameVerifier` (Glide uses HttpURLConnection by default) | `<pin-set>` in `network_security_config_enforce.xml` |

On iOS, TrustKit's `kTSKEnforcePinning: @NO` provides native monitor-only support for all
URLSession traffic, and the react-native-webview patch routes WKWebView challenges through
TrustKit's validator, so all channels are monitored on both platforms.

Pinning is **disabled in debug builds** on every layer (Android `BuildConfig.DEBUG` / debug
`network_security_config_debug.xml`, iOS `#if DEBUG`) so local dev and debugging proxies keep working.

## Sentry reporting

Pin failures are reported from the **native** pinning layer (TrustKit callback on iOS, monitor
interceptors on Android), tagged with:
- `certificate_pinning_host` — the hostname that failed validation
- `certificate_pinning_mode` — `monitor` or `enforce`
- `certificate_pinning_channel` — (Android only) the networking channel: `OkHttp`, `HttpURLConnection`, `WebView`, or `cronet`
- `certificate_pinning_outcome` — (Android only) set on **monitoring failures that are not pin mismatches**:
  `chain_rebuild_failed` (the served chain could not be rebuilt up to its trust-anchor root, so the root
  pins were not evaluated) or `trust_extensions_unavailable` (the platform trust manager could not be
  created; reported once). Events without this tag are real pin mismatches. A `chain_rebuild_failed`
  event is still worth investigating before flipping to enforce mode: OkHttp and the platform rebuild the
  chain the same way, so enforce mode would block that connection.

Reporting requires early native Sentry initialization via `SentryNativeSDKManager` in
`AppDelegate.swift` / `MainApplication.kt` (standalone NewDot) or
`ExpensifyAppDelegate.m` / `Expensify.java` (HybridApp), before certificate pinning. JS
`Sentry.init()` attaches with `autoInitializeNativeSdk: false` so the SDK is not started twice.

Do not rely on JS fetch error message matching for monitoring; it is incomplete (misses WebView paths)
and fragile across OS versions.

## Single source of truth

`config/certificatePinning/pins.json` is the canonical pin list. The native files above mirror it.
When pins change, update **all** of them.

Each domain pins **ONLY the ROOT CA SPKI hashes** of every CA that can issue its certificate. Roots
are the only durable pin target: leaves are re-keyed on every renewal and every CA in play issues
from a rotating pool of intermediates — both have already broken leaf/intermediate pins in
production (the 2026-07-07 Let's Encrypt → GTS edge rotation on Cloudflare, and the 2026-07 Amazon
M01 → M04 intermediate rotation on CloudFront). Root pins survive leaf rotation, intermediate
rotation, AND a CA switch within the pinned set without an emergency release.

- Cloudflare-fronted `*.expensify.com` hosts pin the roots of Let's Encrypt (ISRG X1/X2),
  Google Trust Services (GTS R1/R3/R4), SSL.com (TLS ECC/RSA Root CA 2022), and Sectigo (USERTrust
  RSA/ECC and Sectigo Public Server Authentication Root R46/E46). The first three are the CAs
  Cloudflare rotates between without notice; Sectigo is the additional CA Cloudflare uses for
  [backup certificates](https://developers.cloudflare.com/ssl/edge-certificates/backup-certificates/),
  which it deploys automatically on a certificate revocation or key compromise (see Cloudflare's
  [certificate authorities](https://developers.cloudflare.com/ssl/reference/certificate-authorities/)
  table). Cloudflare explicitly documents that you should **not** pin a single CA's chain
  ([SSL/TLS docs](https://developers.cloudflare.com/ssl/reference/certificate-pinning/)).
  GTS Root R2 is deliberately not pinned: Mozilla removed it from its root store in 2026 (Debian's
  `ca-certificates` 20260601 changelog records the removal), so no publicly trusted chain can anchor at it.
- The CloudFront host pins all five Amazon Trust Services roots (Amazon Root CA 1–4 and Starfield
  Services Root CA G2) — the only stable pin targets AWS documents for ACM-issued certificates.

A TLS server never sends its root, so every monitor that checks the served chain must first rebuild
it up to the trust anchor (see `anchoredChain` in the Kotlin/Java pinners and the chain rebuild in
the WebView monitors); the platform `<pin-set>`, OkHttp's enforce-mode `CertificatePinner`, Cronet's
`addPublicKeyPins`, and TrustKit all evaluate the validated chain (root included) natively. When a
monitor cannot rebuild the chain it does **not** fall through to a pin check on the raw served chain
— that chain has no root, so the check could only ever produce a false mismatch — and reports a
`chain_rebuild_failed` outcome instead (see [Sentry reporting](#sentry-reporting)).

The root certificates are NOT committed. `scripts/generateCertificatePins.sh` downloads them from
the Mozilla CA bundle into a gitignored cache (`config/certificatePinning/roots/`) and verifies each
against the SHA-256 certificate fingerprints committed in the script's `ROOT_MANIFEST` — the
fingerprints, not the downloaded bytes, are the source of trust. The pin hashes are derived from
those verified PEMs, never from live handshakes.

Both production and staging hosts are pinned in every release build, because beta/TestFlight builds
resolve their runtime environment to STAGING and hit `staging.*` APIs while still being non-debug.

## Regenerating pins

```bash
./scripts/generateCertificatePins.sh            # prints the root pins (downloads + fingerprint-verifies the roots on first run)
./scripts/generateCertificatePins.sh --android  # also prints the network_security_config <pin-set> blocks
./scripts/generateCertificatePins.sh --verify   # checks each live chain anchors at a pinned root; exits 1 if any host FAILs or is UNREACHABLE
./scripts/generateCertificatePins.sh --refresh  # force re-download of the cached roots; a cached root the bundle no longer carries is removed
```

Offline/CI use: set `ROOTS_BUNDLE=/path/to/bundle.pem` to read the roots from a local CA bundle
instead of downloading; fingerprint verification still applies. `ROOTS_DIR=/path` overrides the
cache location.

If the script reports that a root in its `ROOT_MANIFEST` is missing from the bundle, Mozilla has
dropped that root (as happened to GTS Root R2 in 2026): investigate, and normally remove the root from
the manifest and from every pin list rather than sourcing it elsewhere.

`tests/unit/generateCertificatePinsTest.ts` runs the script against Node's bundled Mozilla root store
and checks the clean-checkout path, `--refresh`, unreachable hosts under `--verify`, and that
`pins.json` and the native files carry exactly the pins the script generates.

## Rotation runbook

Root pins only need to change when a host starts using a CA whose root is not yet pinned (e.g. a
CDN adds a new CA to its pool), or when a pinned root is distrusted/retired.

1. Look up the new root's SHA-256 certificate fingerprint in the CA's official repository. Add a
   `"<Name>|<FINGERPRINT>"` entry to `ROOT_MANIFEST` and the name to the relevant group in
   `scripts/generateCertificatePins.sh`, then re-run the script (it downloads and
   fingerprint-verifies the certificate).
2. Add the **new** root hash alongside the existing ones (do not remove old ones yet) in
   `pins.json` and all native files, then ship an app release.
3. Run `./scripts/generateCertificatePins.sh --verify` to confirm every live chain anchors at a
   pinned root.
4. Only after old app versions have aged out, remove hashes of roots no longer in play.
5. Never add an `expiration` to the Android `<pin-set>` — an expired pin-set silently disables pinning.
