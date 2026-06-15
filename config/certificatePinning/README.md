# Certificate Pinning (Iteration 1 — NewDot)

SSL certificate pinning for the NewDot React Native app. Pinning is enforced **natively** in each
HTTP stack; there is no single JS switch because the app's networking is spread across several
native stacks.

## Where pinning is enforced

| Stack | Platform | Mechanism | File |
|-------|----------|-----------|------|
| URLSession (`fetch()`, blob-util, etc.) | iOS | TrustKit URLSession swizzling | `ios/CertificatePinning.swift` |
| OkHttp (`fetch()`, blob-util, RN networking) | Android | OkHttp `CertificatePinner` | `android/app/src/main/java/com/expensify/chat/CertificatePinning.kt` |
| HttpURLConnection / Glide | Android | `<pin-set>` | `android/app/src/main/res/xml/network_security_config.xml` |
| WebView | Android | `<pin-set>` | `android/app/src/main/res/xml/network_security_config.xml` |
| WebView (WKWebView) | iOS | TrustKit validator in challenge handler | `patches/react-native-webview+13.16.0.patch` |

Pinning is **disabled in debug builds** on every layer (Android `BuildConfig.DEBUG` / debug
`network_security_config_debug.xml`, iOS `#if DEBUG`) so local dev and debugging proxies keep working.

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
5. A pin failure at runtime is reported to Sentry (tag `certificate_pinning_host`) via
   `src/libs/CertificatePinning`, distinct from ordinary offline errors.
