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
import java.util.concurrent.atomic.AtomicBoolean
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
 * Monitoring problems that are NOT pin mismatches (the served chain could not be rebuilt up to its
 * trust-anchor root, or the platform trust manager is unavailable) are reported separately with the
 * `certificate_pinning_outcome` tag, mirroring [WebViewCertificateMonitor], so they never show up as
 * false pin failures in Sentry.
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
    private const val CERTIFICATE_PINNING_OUTCOME_TAG = "certificate_pinning_outcome"
    private const val OUTCOME_TRUST_EXTENSIONS_UNAVAILABLE = "trust_extensions_unavailable"
    private const val OUTCOME_CHAIN_REBUILD_FAILED = "chain_rebuild_failed"

    private val trustExtensionsFailureReported = AtomicBoolean(false)

    /**
     * Canonical pin data: domain → list of "sha256/<base64>" pin strings.
     * All hashes are ROOT CA SPKIs. Roots are the only durable pin target: leaves are re-keyed on
     * every renewal and every CA in play issues from a rotating pool of intermediates, both of which
     * have already broken leaf/intermediate pins in production (2026-07-07 Let's Encrypt -> GTS edge
     * rotation, 2026-07 Amazon M01 -> M04 intermediate rotation).
     * Keep in sync with config/certificatePinning/pins.json.
     */
    private val CLOUDFLARE_EXPENSIFY_ROOTS = listOf(
        // Let's Encrypt
        "sha256/C5+lpZ7tcVwmwQIMcRtPbsQtWLABXhQzejna0wHFr8M=", // ISRG Root X1
        "sha256/diGVwiVYbubAI3RW4hB9xU8e/CH2GnkuvVFZE8zmgzI=", // ISRG Root X2
        // Google Trust Services (GTS Root R2 is not pinned: Mozilla removed it from its root store in 2026)
        "sha256/hxqRlPTu1bMS/0DITB1SSu0vd4u/8l8TjPgfaAp63Gc=", // GTS Root R1
        "sha256/QXnt2YHvdHR3tJYmQIr0Paosp6t/nggsEGD4QJZ3Q0g=", // GTS Root R3
        "sha256/mEflZT5enoR1FuXLgYYGqnVEoZvmf9c2bVBpiOjYQ0c=", // GTS Root R4
        // SSL.com
        "sha256/G/ANXI8TwJTdF+AFBM8IiIUPEv0Gf6H5LA/b9guG4yE=", // SSL.com TLS ECC Root CA 2022
        "sha256/K89VOmb1cJAN3TK6bf4ezAbJGC1mLcG2Dh97dnwr3VQ=", // SSL.com TLS RSA Root CA 2022
        // Sectigo (Cloudflare backup certificates) - both of its public TLS hierarchies
        "sha256/x4QzPSC810K5/cMjb05Qm4k3Bw5zBn4lTdO/nEW/Td4=", // USERTrust RSA Certification Authority
        "sha256/ICGRfpgmOUXIWcQ/HXPLQTkFPEFPoDyjvH7ohhQpjzs=", // USERTrust ECC Certification Authority
        "sha256/Douxi77vs4G+Ib/BogbTFymEYq0QSFXwSgVCaZcI09Q=", // Sectigo Public Server Authentication Root R46
        "sha256/sLVjNUaFYfW7n6EtgBeEpjOlcnBdNPMrZDRF36iwBdE=", // Sectigo Public Server Authentication Root E46
    )

    private val CLOUDFRONT_ROOTS = listOf(
        "sha256/++MBgDH5WGvL9Bcn5Be30cRcL0f5O+NyoXuWtQdX1aI=", // Amazon Root CA 1
        "sha256/f0KW/FtqTjs108NpYj42SrGvOB2PpxIVM8nWxjPqJGE=", // Amazon Root CA 2
        "sha256/NqvDJlas/GRcYbcWE8S/IceH9cq77kg0jVhZeAPXq8k=", // Amazon Root CA 3
        "sha256/9+ze1cZgR9KO1kZrVDxA4HQ6voHRCSVNz4RdTCx4U8U=", // Amazon Root CA 4
        "sha256/KwccWaCgrnaw6tsrrSO61FgLacNgG2MMLq8GE6+oP5I=", // Starfield Services Root CA G2
    )

    private val PINNED_DOMAINS: Map<String, List<String>> = mapOf(
        // Groups A-D: Cloudflare-fronted expensify.com hosts. Cloudflare can rotate the edge cert
        // between Let's Encrypt, Google Trust Services and SSL.com without notice, and its backup
        // certificates (deployed automatically on a revocation or key compromise) can also come from
        // Sectigo, so the roots of all four CAs are pinned.
        "www.expensify.com" to CLOUDFLARE_EXPENSIFY_ROOTS,
        "secure.expensify.com" to CLOUDFLARE_EXPENSIFY_ROOTS,
        "staging.expensify.com" to CLOUDFLARE_EXPENSIFY_ROOTS,
        "staging-secure.expensify.com" to CLOUDFLARE_EXPENSIFY_ROOTS,
        "new.expensify.com" to CLOUDFLARE_EXPENSIFY_ROOTS,
        "staging.new.expensify.com" to CLOUDFLARE_EXPENSIFY_ROOTS,
        "integrations.expensify.com" to CLOUDFLARE_EXPENSIFY_ROOTS,
        "travel.expensify.com" to CLOUDFLARE_EXPENSIFY_ROOTS,
        "staging.travel.expensify.com" to CLOUDFLARE_EXPENSIFY_ROOTS,
        // Group E: CloudFront CDN. AWS documents the Amazon Trust Services roots as the only stable
        // pin targets for ACM-issued certificates.
        "d2k5nsl2zxldvw.cloudfront.net" to CLOUDFRONT_ROOTS,
    )

    /**
     * System trust manager used to rebuild the validated chain up to its trust anchor. When it cannot
     * be created the root pins cannot be evaluated at all, so the monitors skip their check (reported
     * once with `certificate_pinning_outcome=trust_extensions_unavailable`) rather than produce a
     * false mismatch on every request.
     */
    private val trustManagerExtensions: X509TrustManagerExtensions? by lazy {
        try {
            val tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm())
            tmf.init(null as KeyStore?)
            tmf.trustManagers
                .filterIsInstance<X509TrustManager>()
                .firstOrNull()
                ?.let { X509TrustManagerExtensions(it) }
        } catch (error: Exception) {
            if (trustExtensionsFailureReported.compareAndSet(false, true)) {
                reportMonitoringFailure(
                    hostname = null,
                    urlString = null,
                    channel = "OkHttp",
                    outcome = OUTCOME_TRUST_EXTENSIONS_UNAVAILABLE,
                    message = "Certificate pinning monitor failed to initialize trust manager extensions",
                    cause = error,
                )
            }
            null
        }
    }

    /**
     * Returns the fully validated chain (leaf -> intermediates -> trust-anchor ROOT) for the raw
     * certificates a server presented during the handshake, or a failure if the platform trust
     * manager could not rebuild it.
     *
     * A TLS server sends only its leaf and intermediates - never the root - so calling
     * [CertificatePinner.check] directly on the raw peer list can only ever match a pinned leaf or
     * intermediate, never a pinned ROOT. Because our durable, rotation-proof pins are the CA ROOTs,
     * those pins would silently fail to match on the raw peer chain and produce false pin-mismatch
     * reports. Rebuilding the chain via the system trust manager appends the anchor so the root pins
     * are actually evaluated - matching how the platform `<pin-set>` and OkHttp's own enforce-mode
     * check behave.
     */
    private fun anchoredChain(
        extensions: X509TrustManagerExtensions,
        peerCertificates: List<Certificate>,
        host: String,
    ): Result<List<Certificate>> {
        val x509Chain = peerCertificates.filterIsInstance<X509Certificate>()
        if (x509Chain.isEmpty()) {
            return Result.failure(SSLPeerUnverifiedException("Peer chain for $host contains no X.509 certificates"))
        }

        val authTypes = if (x509Chain.first().publicKey.algorithm == "EC") {
            arrayOf("ECDHE_ECDSA", "ECDSA")
        } else {
            arrayOf("RSA", "ECDHE_RSA")
        }
        val chainArray = x509Chain.toTypedArray()

        var lastException: Exception? = null
        for (authType in authTypes) {
            try {
                val fullChain = extensions.checkServerTrusted(chainArray, authType, host)
                if (fullChain.isNotEmpty()) {
                    return Result.success(fullChain)
                }
            } catch (error: Exception) {
                // Try the next authType.
                lastException = error
            }
        }
        return Result.failure(
            lastException ?: SSLPeerUnverifiedException("Trust manager returned an empty chain for $host"),
        )
    }

    /**
     * Monitor-mode pin check shared by the OkHttp interceptor and the HttpsURLConnection verifier.
     *
     * The served chain is first rebuilt up to its trust-anchor ROOT (see [anchoredChain]) and the
     * pins are evaluated against that chain. If the rebuild fails, the raw peer chain is still
     * checked (a server that happens to send its root can still match), but a failure there is NOT
     * reported as a pin mismatch: the raw chain normally has no root while every pin is a root SPKI,
     * so that failure says nothing about the pins - it would be a false mismatch for a connection the
     * platform already trusted. It is reported as a `chain_rebuild_failed` monitoring outcome instead.
     * This matters for the rollout: in enforce mode OkHttp rebuilds the chain the same way, so a
     * rebuild failure is a real signal that enforce mode would break that connection, and it must
     * stay distinguishable from a pin that no longer matches.
     */
    private fun checkPinsInMonitorMode(
        certificatePinner: CertificatePinner,
        hostname: String,
        peerCertificates: List<Certificate>,
        urlString: String?,
        channel: String,
    ) {
        // Without the platform trust manager the root pins cannot be evaluated at all; the failure was
        // reported once when the lazy initializer ran.
        val extensions = trustManagerExtensions ?: return

        val anchored = anchoredChain(extensions, peerCertificates, hostname)
        try {
            certificatePinner.check(hostname, anchored.getOrDefault(peerCertificates))
        } catch (error: SSLPeerUnverifiedException) {
            val rebuildFailure = anchored.exceptionOrNull()
            if (rebuildFailure != null) {
                reportMonitoringFailure(
                    hostname = hostname,
                    urlString = urlString,
                    channel = channel,
                    outcome = OUTCOME_CHAIN_REBUILD_FAILED,
                    message = "Certificate chain reconstruction failed for $hostname; root pins were not evaluated",
                    cause = rebuildFailure,
                )
                return
            }
            reportPinningFailure(
                hostname = hostname,
                urlString = urlString,
                channel = channel,
                message = error.message ?: "Certificate pinning validation failed",
            )
        }
    }

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
                    checkPinsInMonitorMode(
                        certificatePinner = certificatePinner,
                        hostname = hostname,
                        // Throws SSLPeerUnverifiedException if the session has no verified peer.
                        peerCertificates = session.peerCertificates.toList(),
                        urlString = null,
                        channel = "HttpURLConnection",
                    )
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
     * Reports a problem with the monitoring itself (not a pin mismatch), tagged with
     * `certificate_pinning_outcome` so it can be told apart from real pin failures in Sentry.
     * Mirrors [WebViewCertificateMonitor].
     */
    private fun reportMonitoringFailure(
        hostname: String?,
        urlString: String?,
        channel: String,
        outcome: String,
        message: String,
        cause: Throwable?,
    ) {
        val exception = cause ?: SSLPeerUnverifiedException(message)
        Sentry.captureException(exception) { scope ->
            scope.level = SentryLevel.WARNING
            hostname?.let { scope.setTag(CERTIFICATE_PINNING_HOST_TAG, it) }
            scope.setTag(CERTIFICATE_PINNING_MODE_TAG, if (ENFORCE_PINNING) "enforce" else "monitor")
            scope.setTag(CERTIFICATE_PINNING_CHANNEL_TAG, channel)
            scope.setTag(CERTIFICATE_PINNING_OUTCOME_TAG, outcome)
            urlString?.let { scope.setExtra("url", it) }
            if (cause != null) {
                scope.setExtra("monitoringFailureMessage", message)
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
     * Used during the monitor-only rollout phase. See [checkPinsInMonitorMode]: the served chain is
     * rebuilt up to the trust-anchor ROOT first so our root pins are actually evaluated, and a chain
     * that cannot be rebuilt is reported as a monitoring outcome rather than a false pin mismatch.
     */
    private class CertificatePinningMonitorInterceptor(
        private val certificatePinner: CertificatePinner,
    ) : Interceptor {
        override fun intercept(chain: Interceptor.Chain): Response {
            val request = chain.request()
            val response = chain.proceed(request)
            val handshake = chain.connection()?.handshake()

            // Only the pinned hosts are validated (and only they pay the chain-rebuild cost in
            // anchoredChain); all other traffic passes through untouched.
            if (handshake != null && PINNED_DOMAINS.containsKey(request.url.host)) {
                checkPinsInMonitorMode(
                    certificatePinner = certificatePinner,
                    hostname = request.url.host,
                    peerCertificates = handshake.peerCertificates,
                    urlString = redactUrl(request.url),
                    channel = "OkHttp",
                )
            }

            return response
        }
    }
}
