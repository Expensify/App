package com.expensify.chat

import com.facebook.react.modules.network.OkHttpClientProvider
import io.sentry.Sentry
import io.sentry.SentryLevel
import okhttp3.CertificatePinner
import okhttp3.Interceptor
import okhttp3.Response
import javax.net.ssl.HttpsURLConnection
import javax.net.ssl.SSLPeerUnverifiedException

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
     * Canonical pin data: domain → list of "sha256/<base64>" pin strings.
     * The first hash is the leaf SPKI, the second is the issuing intermediate CA SPKI.
     * Keep in sync with config/certificatePinning/pins.json.
     */
    private val PINNED_DOMAINS: Map<String, List<String>> = mapOf(
        // Group A: leaf CN=expensify.com + Let's Encrypt YE1 intermediate
        "www.expensify.com" to listOf("sha256/cSP5K9Slk59AgwZPst+dLPuNE+ZhypUlYRQNW1XC/fc=", "sha256/brzvtCELCIZUo4sD/qPX0ccRtPsd3DY6RfmxpOU9oB4="),
        "secure.expensify.com" to listOf("sha256/cSP5K9Slk59AgwZPst+dLPuNE+ZhypUlYRQNW1XC/fc=", "sha256/brzvtCELCIZUo4sD/qPX0ccRtPsd3DY6RfmxpOU9oB4="),
        "staging.expensify.com" to listOf("sha256/cSP5K9Slk59AgwZPst+dLPuNE+ZhypUlYRQNW1XC/fc=", "sha256/brzvtCELCIZUo4sD/qPX0ccRtPsd3DY6RfmxpOU9oB4="),
        "staging-secure.expensify.com" to listOf("sha256/cSP5K9Slk59AgwZPst+dLPuNE+ZhypUlYRQNW1XC/fc=", "sha256/brzvtCELCIZUo4sD/qPX0ccRtPsd3DY6RfmxpOU9oB4="),
        // Group B: leaf CN=expensify.com + Google Trust Services WE1 intermediate
        "new.expensify.com" to listOf("sha256/G2v6PWWl92F5vVHCtAYwScBHqNtPMkxb++SFoBJq5F4=", "sha256/kIdp6NNEd8wsugYyyIYFsi1ylMCED3hZbSR8ZFsa/A4="),
        "staging.new.expensify.com" to listOf("sha256/G2v6PWWl92F5vVHCtAYwScBHqNtPMkxb++SFoBJq5F4=", "sha256/kIdp6NNEd8wsugYyyIYFsi1ylMCED3hZbSR8ZFsa/A4="),
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
     * Mismatches are reported to Sentry without failing the connection (monitor mode only).
     */
    private fun installHttpsURLConnectionMonitor(certificatePinner: CertificatePinner) {
        val originalVerifier = HttpsURLConnection.getDefaultHostnameVerifier()
        HttpsURLConnection.setDefaultHostnameVerifier { hostname, session ->
            val result = originalVerifier.verify(hostname, session)
            if (result && PINNED_DOMAINS.containsKey(hostname)) {
                try {
                    certificatePinner.check(hostname, session.peerCertificates.toList())
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
     * Used during the monitor-only rollout phase.
     */
    private class CertificatePinningMonitorInterceptor(
        private val certificatePinner: CertificatePinner,
    ) : Interceptor {
        override fun intercept(chain: Interceptor.Chain): Response {
            val request = chain.request()
            val response = chain.proceed(request)
            val handshake = chain.connection()?.handshake()

            if (handshake != null) {
                try {
                    certificatePinner.check(request.url.host, handshake.peerCertificates)
                } catch (error: SSLPeerUnverifiedException) {
                    reportPinningFailure(
                        hostname = request.url.host,
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
