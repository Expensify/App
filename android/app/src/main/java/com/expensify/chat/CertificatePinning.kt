package com.expensify.chat

import android.net.http.X509TrustManagerExtensions
import com.facebook.react.modules.network.OkHttpClientProvider
import io.sentry.Sentry
import io.sentry.SentryLevel
import okhttp3.CertificatePinner
import okhttp3.Interceptor
import okhttp3.Response
import java.security.KeyStore
import java.security.cert.Certificate
import java.security.cert.X509Certificate
import javax.net.ssl.HttpsURLConnection
import javax.net.ssl.SSLPeerUnverifiedException
import javax.net.ssl.TrustManagerFactory
import javax.net.ssl.X509TrustManager

/**
 * Certificate pinning for React Native's shared OkHttp client (Iteration 1 - NewDot).
 *
 * On Android, `react-native-blob-util` (authenticated attachment/receipt downloads), Fresco, and
 * other React Native networking consumers route through `OkHttpClientProvider.getOkHttpClient()`.
 * Installing an [OkHttpClientProvider] factory with an OkHttp [CertificatePinner] here pins that
 * traffic. JavaScript `fetch()` uses NitroFetch/Cronet and is pinned separately by the
 * `react-native-nitro-fetch` patch.
 *
 * Additional networking channels are also monitored:
 * - **HttpURLConnection**: A wrapping [javax.net.ssl.HostnameVerifier] validates pins after the
 *   platform verifier succeeds. This covers native libraries using [java.net.URL] instead of OkHttp.
 * - **WebView**: A react-native-webview patch calls [WebViewCertificateMonitor] to validate the
 *   page's SSL certificate SPKI hash after load.
 * - **Fresco** (React Native Image): Uses OkHttp via [OkHttpClientProvider] — already covered by
 *   the OkHttp [CertificatePinner].
 *
 * When [ENFORCE_PINNING] is false, all monitors validate pins after each TLS handshake and
 * report mismatches to Sentry without blocking the request. Android `<pin-set>` enforcement in
 * network_security_config is deferred until enforce mode (see network_security_config_enforce.xml).
 *
 * Keep the pins in sync with config/certificatePinning/pins.json,
 * android/app/src/main/res/xml/network_security_config_enforce.xml, and ios/CertificatePinning.swift.
 * Regenerate via scripts/generateCertificatePins.sh.
 */
object CertificatePinning {
    /**
     * When false, pin mismatches are reported to Sentry but connections are not blocked.
     * Flip to true after 1-2 weeks of monitor-only data shows ~0 false positives.
     * Keep in sync with `enforcePinning` in config/certificatePinning/pins.json and CertificatePinning.swift.
     */
    private const val ENFORCE_PINNING = false

    private const val CERTIFICATE_PINNING_HOST_TAG = "certificate_pinning_host"
    private const val CERTIFICATE_PINNING_MODE_TAG = "certificate_pinning_mode"
    private const val CERTIFICATE_PINNING_CHANNEL_TAG = "certificate_pinning_channel"

    /**
     * Cloudflare can issue the expensify.com edge certificate from any of the CAs it uses -
     * Let's Encrypt, Google Trust Services or SSL.com - and can rotate between them without notice
     * (the unannounced 2026-07-07 Let's Encrypt -> Google Trust Services rotation is what broke us).
     * To survive leaf rotation, intermediate rotation AND a CA switch without an emergency release, the
     * Cloudflare-fronted hosts (Groups A & B) pin the SPKI of the ROOT of each of those three CAs, plus
     * the live issuing intermediate for each. Any of these appearing in the served chain satisfies the
     * pin. Regenerate with scripts/generateCertificatePins.sh (which also prints these CA pins).
     */
    private val CLOUDFLARE_EXPENSIFY_PINS: List<String> = listOf(
        // Let's Encrypt - live CA for www/secure/staging (reverted to Let's Encrypt after the 2026-07-07 GTS rotation)
        "sha256/C5+lpZ7tcVwmwQIMcRtPbsQtWLABXhQzejna0wHFr8M=", // ISRG Root X1
        "sha256/diGVwiVYbubAI3RW4hB9xU8e/CH2GnkuvVFZE8zmgzI=", // ISRG Root X2
        "sha256/brzvtCELCIZUo4sD/qPX0ccRtPsd3DY6RfmxpOU9oB4=", // Let's Encrypt YE1 intermediate (live ECDSA)
        // Google Trust Services - backup CA
        "sha256/hxqRlPTu1bMS/0DITB1SSu0vd4u/8l8TjPgfaAp63Gc=", // GTS Root R1
        "sha256/Vfd95BwDeSQo+NUYxVEEIlvkOlWY2SalKK1lPhzOx78=", // GTS Root R2
        "sha256/QXnt2YHvdHR3tJYmQIr0Paosp6t/nggsEGD4QJZ3Q0g=", // GTS Root R3
        "sha256/mEflZT5enoR1FuXLgYYGqnVEoZvmf9c2bVBpiOjYQ0c=", // GTS Root R4
        "sha256/kIdp6NNEd8wsugYyyIYFsi1ylMCED3hZbSR8ZFsa/A4=", // Google Trust Services WE1 intermediate (live ECDSA)
        // SSL.com - backup CA
        "sha256/G/ANXI8TwJTdF+AFBM8IiIUPEv0Gf6H5LA/b9guG4yE=", // SSL.com TLS ECC Root CA 2022
        "sha256/K89VOmb1cJAN3TK6bf4ezAbJGC1mLcG2Dh97dnwr3VQ=", // SSL.com TLS RSA Root CA 2022
    )

    /**
     * Canonical pin data: domain → list of "sha256/<base64>" pin strings.
     * Keep in sync with config/certificatePinning/pins.json.
     */
    private val PINNED_DOMAINS: Map<String, List<String>> = mapOf(
        // Groups A & B: Cloudflare-fronted expensify.com hosts - multi-CA root + intermediate pinning (see above)
        "www.expensify.com" to CLOUDFLARE_EXPENSIFY_PINS,
        "secure.expensify.com" to CLOUDFLARE_EXPENSIFY_PINS,
        "staging.expensify.com" to CLOUDFLARE_EXPENSIFY_PINS,
        "staging-secure.expensify.com" to CLOUDFLARE_EXPENSIFY_PINS,
        "new.expensify.com" to CLOUDFLARE_EXPENSIFY_PINS,
        "staging.new.expensify.com" to CLOUDFLARE_EXPENSIFY_PINS,
        // Group C: integrations leaf + Let's Encrypt R13 intermediate
        "integrations.expensify.com" to listOf("sha256/7D0dEgdEKEMYRTgVwvnhJv19B4apk0QM/GPnRAKRGUs=", "sha256/AlSQhgtJirc8ahLyekmtX+Iw+v46yPYRLJt9Cq1GlB0="),
        // Group D: travel leaf + Google Trust Services WE1 intermediate
        "travel.expensify.com" to listOf("sha256/Qb3qmTdRt/xHEN5PVtn+YhKoGqF/lhRX88cSFuSCJqM=", "sha256/kIdp6NNEd8wsugYyyIYFsi1ylMCED3hZbSR8ZFsa/A4="),
        "staging.travel.expensify.com" to listOf("sha256/Qb3qmTdRt/xHEN5PVtn+YhKoGqF/lhRX88cSFuSCJqM=", "sha256/kIdp6NNEd8wsugYyyIYFsi1ylMCED3hZbSR8ZFsa/A4="),
        // Group E: CloudFront CDN leaf + Amazon RSA 2048 M01 intermediate
        "d2k5nsl2zxldvw.cloudfront.net" to listOf("sha256/P9HBoLji8YncXSnb0AnAm72fJO/vpmxZrsl4fvUBkxc=", "sha256/DxH4tt40L+eduF6szpY6TONlxhZhBd+pJ9wbHlQ2fuw="),
    )

    private fun buildCertificatePinner(): CertificatePinner {
        val builder = CertificatePinner.Builder()
        for ((domain, pins) in PINNED_DOMAINS) {
            builder.add(domain, *pins.toTypedArray())
        }
        return builder.build()
    }

    /**
     * System trust manager used to rebuild the validated chain up to its trust anchor. Lazily
     * initialized; null if the platform trust manager is unavailable.
     */
    private val trustManagerExtensions: X509TrustManagerExtensions? by lazy {
        try {
            val tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm())
            tmf.init(null as KeyStore?)
            val tm = tmf.trustManagers
                .filterIsInstance<X509TrustManager>()
                .firstOrNull() ?: return@lazy null
            X509TrustManagerExtensions(tm)
        } catch (_: Exception) {
            null
        }
    }

    /**
     * Returns the fully validated chain (leaf → intermediates → trust-anchor ROOT) for the raw
     * certificates a server presented during the handshake.
     *
     * A TLS server sends only its leaf and intermediates — never the root — so calling
     * [CertificatePinner.check] directly on the raw peer list can only ever match a pinned leaf or
     * intermediate, never a pinned ROOT. Because our durable, rotation-proof pins are the CA ROOTs
     * (a leaf/intermediate rotation must not require an app update), those pins would silently fail
     * to match on the raw peer chain and produce false pin-mismatch reports whenever a CA issues from
     * an intermediate we don't happen to pin. Rebuilding the chain via the system trust manager
     * appends the anchor, so the root pins are actually evaluated — matching how the platform
     * `<pin-set>` and OkHttp's own enforce-mode check behave. Mirrors
     * [WebViewCertificateMonitor]'s chain reconstruction. Falls back to the raw peer certificates if
     * reconstruction is unavailable or fails, so behaviour is never worse than before.
     */
    private fun anchoredChain(peerCertificates: List<Certificate>, host: String): List<Certificate> {
        val extensions = trustManagerExtensions ?: return peerCertificates
        val x509Chain = peerCertificates.filterIsInstance<X509Certificate>()
        val leaf = x509Chain.firstOrNull() ?: return peerCertificates

        val authTypes = if (leaf.publicKey.algorithm == "EC") {
            arrayOf("ECDHE_ECDSA", "ECDSA")
        } else {
            arrayOf("RSA", "ECDHE_RSA")
        }

        for (authType in authTypes) {
            try {
                val fullChain = extensions.checkServerTrusted(x509Chain.toTypedArray(), authType, host)
                if (fullChain.isNotEmpty()) {
                    return fullChain
                }
            } catch (_: Exception) {
                // Try the next authType; fall back to the raw peer chain if all fail.
            }
        }
        return peerCertificates
    }

    /**
     * Install the pinned OkHttp client factory. Must be called before any networking (i.e. early in
     * [MainApplication.onCreate]). Pinning is disabled in debug builds so local dev keeps working.
     */
    @JvmStatic
    fun install() {
        if (BuildConfig.DEBUG) {
            return
        }

        val certificatePinner = buildCertificatePinner()
        OkHttpClientProvider.setOkHttpClientFactory {
            val clientBuilder = OkHttpClientProvider.createClientBuilder()
            if (ENFORCE_PINNING) {
                clientBuilder.certificatePinner(certificatePinner)
                clientBuilder.addInterceptor(CertificatePinningEnforceReportingInterceptor())
            } else {
                clientBuilder.addNetworkInterceptor(CertificatePinningMonitorInterceptor(certificatePinner))
            }
            clientBuilder.build()
        }

        installHttpsURLConnectionMonitor(certificatePinner)
        initializeWebViewMonitor()
    }

    /**
     * Installs a wrapping [javax.net.ssl.HostnameVerifier] on [HttpsURLConnection] that validates
     * certificate pins after the platform hostname verifier succeeds. This covers native code and
     * third-party libraries that use [java.net.URL] / [HttpsURLConnection] instead of OkHttp.
     * The served chain is passed through [anchoredChain] first so root pins are evaluated, not just
     * the leaf/intermediate the server sent. Mismatches are reported to Sentry without failing the
     * connection (monitor mode only).
     */
    private fun installHttpsURLConnectionMonitor(certificatePinner: CertificatePinner) {
        val originalVerifier = HttpsURLConnection.getDefaultHostnameVerifier()
        HttpsURLConnection.setDefaultHostnameVerifier { hostname, session ->
            val result = originalVerifier.verify(hostname, session)
            if (result && PINNED_DOMAINS.containsKey(hostname)) {
                try {
                    certificatePinner.check(hostname, anchoredChain(session.peerCertificates.toList(), hostname))
                } catch (error: SSLPeerUnverifiedException) {
                    reportPinningFailure(
                        hostname = hostname,
                        urlString = null,
                        channel = "HttpURLConnection",
                        message = error.message ?: "Certificate pinning validation failed",
                    )
                }
            }
            result
        }
    }

    /**
     * Initializes [WebViewCertificateMonitor] with the canonical pin data so it can validate
     * WebView SSL certificates. The monitor is invoked from a react-native-webview patch.
     */
    private fun initializeWebViewMonitor() {
        val domainsForWebView: Map<String, Set<String>> = PINNED_DOMAINS.mapValues { (_, pins) ->
            pins.map { it.removePrefix("sha256/") }.toSet()
        }
        WebViewCertificateMonitor.initialize(domainsForWebView, ENFORCE_PINNING)
    }

    /**
     * Strips query parameters from a URL so credentials (e.g. authToken) are never sent to Sentry.
     */
    private fun redactUrl(url: okhttp3.HttpUrl): String =
        url.newBuilder().query(null).fragment(null).build().toString()

    private fun reportPinningFailure(hostname: String, url: okhttp3.HttpUrl, channel: String, message: String) {
        reportPinningFailure(hostname, redactUrl(url), channel, message)
    }

    private fun reportPinningFailure(hostname: String, urlString: String?, channel: String, message: String) {
        Sentry.captureException(SSLPeerUnverifiedException(message)) { scope ->
            scope.level = SentryLevel.WARNING
            scope.setTag(CERTIFICATE_PINNING_HOST_TAG, hostname)
            scope.setTag(CERTIFICATE_PINNING_MODE_TAG, if (ENFORCE_PINNING) "enforce" else "monitor")
            scope.setTag(CERTIFICATE_PINNING_CHANNEL_TAG, channel)
            if (urlString != null) {
                scope.setExtra("url", urlString)
            }
        }
    }

    /**
     * Application-level interceptor that catches pin failures thrown by [CertificatePinner] during
     * connection setup, reports them to Sentry, and re-throws so the request still fails.
     * This keeps telemetry flowing in enforce mode, matching iOS TrustKit behaviour.
     */
    private class CertificatePinningEnforceReportingInterceptor : Interceptor {
        override fun intercept(chain: Interceptor.Chain): Response {
            try {
                return chain.proceed(chain.request())
            } catch (error: SSLPeerUnverifiedException) {
                reportPinningFailure(
                    hostname = chain.request().url.host,
                    url = chain.request().url,
                    channel = "OkHttp",
                    message = error.message ?: "Certificate pinning validation failed",
                )
                throw error
            }
        }
    }

    /**
     * Validates certificate pins after the TLS handshake completes without blocking the request.
     * Used during the monitor-only rollout phase. The served chain is passed through [anchoredChain]
     * first so the trust-anchor ROOT is included and our root pins are actually evaluated (see
     * [anchoredChain]); otherwise only a pinned leaf/intermediate could ever match here.
     */
    private class CertificatePinningMonitorInterceptor(
        private val certificatePinner: CertificatePinner,
    ) : Interceptor {
        override fun intercept(chain: Interceptor.Chain): Response {
            val request = chain.request()
            val response = chain.proceed(request)
            val host = request.url.host
            val handshake = chain.connection()?.handshake()

            // Only the pinned expensify hosts are validated (and only they pay the chain-rebuild
            // cost in anchoredChain); all other traffic passes through untouched.
            if (handshake != null && PINNED_DOMAINS.containsKey(host)) {
                try {
                    certificatePinner.check(host, anchoredChain(handshake.peerCertificates, host))
                } catch (error: SSLPeerUnverifiedException) {
                    reportPinningFailure(
                        hostname = host,
                        url = request.url,
                        channel = "OkHttp",
                        message = error.message ?: "Certificate pinning validation failed",
                    )
                }
            }

            return response
        }
    }
}
