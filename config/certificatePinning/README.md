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

## Cloudflare-fronted hosts: multi-CA root + intermediate pinning

The `expensify.com` edge certificates for `www`, `secure`, `staging`, `staging-secure`, `new` and
`staging.new` are issued by **Cloudflare**, which can pick — and rotate between — any of the CAs it
uses (**Let's Encrypt**, **Google Trust Services**, **SSL.com**) without notice. An unannounced
Let's Encrypt → Google Trust Services rotation on 2026-07-07 is what broke pinning; `www` has since
reverted to Let's Encrypt. Cloudflare explicitly documents that you should **not** pin a single CA's
chain ([SSL/TLS docs](https://developers.cloudflare.com/ssl/reference/certificate-pinning/)).

To keep the app working across leaf rotation, intermediate rotation, **and** a switch between those
three CAs — without shipping an emergency release each time — these six hosts (Groups A & B) share
one pin set that pins the **SPKI of the ROOT** of all three CAs plus each CA's **live issuing
intermediate**. Pinning the roots is what survives an intermediate rotation (the failure mode that
hit us). Any one of these appearing in the served chain satisfies the pin:

| CA | Pin (base64 SHA-256 of SPKI) | Certificate |
|----|------------------------------|-------------|
| Let's Encrypt | `C5+lpZ7tcVwmwQIMcRtPbsQtWLABXhQzejna0wHFr8M=` | ISRG Root X1 (RSA 4096) |
| Let's Encrypt | `diGVwiVYbubAI3RW4hB9xU8e/CH2GnkuvVFZE8zmgzI=` | ISRG Root X2 (ECDSA P-384) |
| Let's Encrypt | `brzvtCELCIZUo4sD/qPX0ccRtPsd3DY6RfmxpOU9oB4=` | Let's Encrypt YE1 (live ECDSA intermediate) |
| Google Trust Services | `hxqRlPTu1bMS/0DITB1SSu0vd4u/8l8TjPgfaAp63Gc=` | GTS Root R1 (RSA 4096) |
| Google Trust Services | `Vfd95BwDeSQo+NUYxVEEIlvkOlWY2SalKK1lPhzOx78=` | GTS Root R2 (RSA 4096) |
| Google Trust Services | `QXnt2YHvdHR3tJYmQIr0Paosp6t/nggsEGD4QJZ3Q0g=` | GTS Root R3 (ECDSA P-384) |
| Google Trust Services | `mEflZT5enoR1FuXLgYYGqnVEoZvmf9c2bVBpiOjYQ0c=` | GTS Root R4 (ECDSA P-384) |
| Google Trust Services | `kIdp6NNEd8wsugYyyIYFsi1ylMCED3hZbSR8ZFsa/A4=` | GTS WE1 (live ECDSA intermediate) |
| SSL.com | `G/ANXI8TwJTdF+AFBM8IiIUPEv0Gf6H5LA/b9guG4yE=` | SSL.com TLS ECC Root CA 2022 (ECDSA P-384) |
| SSL.com | `K89VOmb1cJAN3TK6bf4ezAbJGC1mLcG2Dh97dnwr3VQ=` | SSL.com TLS RSA Root CA 2022 (RSA 4096) |

These root/intermediate pins are broad by design (they trust each CA's whole hierarchy), which is the
tightest safe posture for a host whose CA is controlled by Cloudflare. The other groups
(`integrations`, `travel`, CloudFront) are single-CA and keep the tighter leaf + issuing-intermediate
pinning. Trade-off accepted per the incident: resilience over a narrower trust set for the Cloudflare
hosts.

**Before flipping these hosts to enforce mode**, re-run `scripts/generateCertificatePins.sh
--ca-pins` on a networked machine to confirm each root/intermediate SPKI still matches (roots are
stable for years, but confirm) and that the live `www`/`new` chains still terminate in one of the
pinned CAs.

## Regenerating pins

```bash
./scripts/generateCertificatePins.sh            # prints leaf + intermediate hashes per domain
./scripts/generateCertificatePins.sh --android  # also prints the network_security_config <pin-set>
./scripts/generateCertificatePins.sh --ca-pins  # prints the multi-CA root+intermediate pins for the
                                                # Cloudflare-fronted expensify.com hosts (Groups A & B),
                                                # computed from each CA's official published certificate
```

## Rotation runbook

1. A few weeks before a certificate changes, run the generator against the new certificate.
2. Add the **new** hashes alongside the existing ones (do not remove the old ones yet) in
   `pins.json` and all native files, then ship an app release.
3. After the new certificate is live and the old app versions have aged out, remove the stale hashes.
4. Never add an `expiration` to the Android `<pin-set>` — an expired pin-set silently disables pinning.
