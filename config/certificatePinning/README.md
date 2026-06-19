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
| OkHttp (`fetch()`, blob-util, RN networking) | Android | OkHttp `CertificatePinner` | `android/app/src/main/java/com/expensify/chat/CertificatePinning.kt` |
| OkHttp (OldDot HybridApp) | Android | OkHttp `CertificatePinner` | `Mobile-Expensify/Android/.../ExpensifyCertificatePinner.java` |
| HttpURLConnection / Glide | Android | `<pin-set>` (enforce mode only) | `network_security_config_enforce.xml` |
| HttpURLConnection / Glide (HybridApp) | Android | `<pin-set>` (enforce mode only) | `Mobile-Expensify/Android/res/xml/network_security_config_enforce.xml` |
| WebView | Android | `<pin-set>` (enforce mode only) | `network_security_config_enforce.xml` |
| WebView (WKWebView) | iOS | TrustKit validator in challenge handler | `patches/react-native-webview+13.16.0.patch` |
| WebView (OldDot HybridApp) | iOS | TrustKit validator in challenge handler | `Mobile-Expensify/iOS/Expensify/Libraries/YAPL-Cocoa/Elements/YAPLWKWebView.m` |

Pinning is **disabled in debug builds** on every layer (Android `BuildConfig.DEBUG` / debug
`network_security_config_debug.xml`, iOS `#if DEBUG`) so local dev and debugging proxies keep working.

## Sentry reporting

Pin failures are reported from the **native** pinning layer (TrustKit callback on iOS, OkHttp monitor
interceptor on Android), tagged with:
- `certificate_pinning_host` — the hostname that failed validation
- `certificate_pinning_mode` — `monitor` or `enforce`

Reporting requires early native Sentry initialization via `SentryNativeSDKManager` in
`AppDelegate.swift` / `MainApplication.kt` (standalone NewDot) or
`ExpensifyAppDelegate.m` / `Expensify.java` (HybridApp), before certificate pinning. JS
`Sentry.init()` attaches with `autoInitializeNativeSdk: false` so the SDK is not started twice.

Do not rely on JS fetch error message matching for monitoring; it is incomplete (misses WebView paths)
and fragile across OS versions.

## Single source of truth

`config/certificatePinning/pins.json` is the canonical pin list. The native files above mirror it.
When pins change, update **all** of them. Each domain pins:

1. The leaf certificate SPKI hash (primary).
2. The issuing intermediate CA SPKI hash (durable backup that survives leaf rotation — Let's Encrypt
   leaves rotate roughly every 90 days; the intermediate is stable for years).

Both production and staging hosts are pinned in every release build, because beta/TestFlight builds
resolve their runtime environment to STAGING and hit `staging.*` APIs while still being non-debug.

## Regenerating pins

```bash
./scripts/generateCertificatePins.sh            # prints leaf + intermediate hashes per domain
./scripts/generateCertificatePins.sh --android  # also prints the network_security_config <pin-set>
```

## Rotation runbook

1. A few weeks before a certificate changes, run the generator against the new certificate.
2. Add the **new** hashes alongside the existing ones (do not remove the old ones yet) in
   `pins.json` and all native files, then ship an app release.
3. After the new certificate is live and the old app versions have aged out, remove the stale hashes.
4. Never add an `expiration` to the Android `<pin-set>` — an expired pin-set silently disables pinning.
