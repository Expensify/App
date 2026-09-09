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
| WebView (react-native-webview) | `WebViewCertificateMonitor.kt` (SPKI check on leaf cert after page load) | `<pin-set>` in `network_security_config_enforce.xml` |
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
- `certificate_pinning_channel` — (Android only) the networking channel: `OkHttp`, `HttpURLConnection`, or `WebView`

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
