package com.expensify.chat

import android.net.http.SslCertificate
import android.net.http.X509TrustManagerExtensions
import android.net.Uri
import android.os.Build
import android.webkit.WebView
import io.sentry.Sentry
import io.sentry.SentryLevel
import java.io.ByteArrayInputStream
import java.security.KeyStore
import java.security.MessageDigest
import java.security.cert.CertificateFactory
import java.security.cert.X509Certificate
import java.util.concurrent.atomic.AtomicBoolean
import javax.net.ssl.SSLPeerUnverifiedException
import javax.net.ssl.TrustManagerFactory
import javax.net.ssl.X509TrustManager

/**
 * Monitors WebView SSL certificates against pinned intermediate SPKI hashes. Android WebView does
 * not expose a TLS authentication-challenge delegate like iOS WKWebView, so this class validates
 * the certificate returned by [WebView.getCertificate] after page load. It is invoked from a patch
 * applied to react-native-webview's [RNCWebViewClient.onPageFinished] via reflection (the library
 * module cannot directly depend on the app module).
 *
 * In monitor mode mismatches are reported to Sentry without blocking the page. In enforce mode the
 * platform's `<pin-set>` in network_security_config handles blocking; this class still reports for
 * telemetry.
 */
object WebViewCertificateMonitor {
    private const val CERTIFICATE_PINNING_HOST_TAG = "certificate_pinning_host"
    private const val CERTIFICATE_PINNING_MODE_TAG = "certificate_pinning_mode"
    private const val CERTIFICATE_PINNING_CHANNEL_TAG = "certificate_pinning_channel"
    private const val CERTIFICATE_PINNING_OUTCOME_TAG = "certificate_pinning_outcome"
    private const val OUTCOME_TRUST_EXTENSIONS_UNAVAILABLE = "trust_extensions_unavailable"
    private const val OUTCOME_CHAIN_REBUILD_FAILED = "chain_rebuild_failed"

    @Volatile
    private var initialized = false
    private var enforcePinning = false

    /** Domain → set of base64-encoded SHA-256 SPKI hashes (without the "sha256/" prefix). */
    private var pinnedDomains: Map<String, Set<String>> = emptyMap()

    private val trustExtensionsFailureReported = AtomicBoolean(false)

    private val trustManagerExtensions: X509TrustManagerExtensions? by lazy {
        try {
            val tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm())
            tmf.init(null as KeyStore?)
            val tm = tmf.trustManagers
                .filterIsInstance<X509TrustManager>()
                .firstOrNull() ?: return@lazy null
            X509TrustManagerExtensions(tm)
        } catch (e: Exception) {
            if (trustExtensionsFailureReported.compareAndSet(false, true)) {
                reportMonitoringFailure(
                    message = "WebView certificate monitor failed to initialize trust manager extensions",
                    hostname = null,
                    url = null,
                    outcome = OUTCOME_TRUST_EXTENSIONS_UNAVAILABLE,
                    cause = e,
                )
            }
            null
        }
    }

    /**
     * Called once from [CertificatePinning.install] with the canonical pin data. Not called in
     * debug builds, so [validateCertificate] becomes a no-op.
     */
    fun initialize(domains: Map<String, Set<String>>, enforce: Boolean) {
        pinnedDomains = domains
        enforcePinning = enforce
        initialized = true
    }

    /**
     * Validates the SSL certificate of the loaded page against pinned SPKI hashes. Called from the
     * react-native-webview patch via reflection.
     *
     * WebView pins are intermediate-only. [WebView.getCertificate] exposes only the leaf, which is
     * used solely to rebuild the chain via [X509TrustManagerExtensions.checkServerTrusted]. A pin is
     * satisfied if any intermediate or root in the rebuilt chain matches the pin set. When chain
     * reconstruction fails, validation is skipped rather than reported as a mismatch.
     */
    @JvmStatic
    fun validateCertificate(webView: WebView, url: String) {
        if (!initialized) return

        val host = try {
            Uri.parse(url).host ?: return
        } catch (_: Exception) {
            return
        }

        val expectedHashes = pinnedDomains[host] ?: return

        val sslCertificate = webView.certificate ?: return
        val leafCert = extractX509Certificate(sslCertificate) ?: return

        val chainHashes = buildChainHashes(leafCert, host, url)
        if (chainHashes.isEmpty()) return

        if (chainHashes.any { it in expectedHashes }) return

        reportMismatch(host, url, chainHashes, expectedHashes)
    }

    /**
     * Builds the certificate chain from the leaf using the system trust manager and returns SPKI
     * hashes for all certificates beyond the leaf (intermediates and root). Returns an empty list
     * if chain building fails.
     */
    private fun buildChainHashes(leafCert: X509Certificate, host: String, url: String): List<String> {
        val extensions = trustManagerExtensions ?: return emptyList()

        val authTypes = if (leafCert.publicKey.algorithm == "EC") {
            arrayOf("ECDHE_ECDSA", "ECDSA")
        } else {
            arrayOf("RSA", "ECDHE_RSA")
        }

        var lastException: Exception? = null
        for (authType in authTypes) {
            try {
                val fullChain = extensions.checkServerTrusted(arrayOf(leafCert), authType, host)
                val hashes = fullChain.drop(1).mapNotNull { computeSpkiSha256(it) }
                if (hashes.isNotEmpty()) {
                    return hashes
                }
            } catch (e: Exception) {
                lastException = e
            }
        }

        reportMonitoringFailure(
            message = "WebView certificate chain reconstruction failed for $host",
            hostname = host,
            url = url,
            outcome = OUTCOME_CHAIN_REBUILD_FAILED,
            cause = lastException,
        )
        return emptyList()
    }

    @Suppress("DEPRECATION")
    private fun extractX509Certificate(sslCert: SslCertificate): X509Certificate? {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            return sslCert.x509Certificate
        }
        return try {
            val bundle = SslCertificate.saveState(sslCert)
            val bytes = bundle.getByteArray("x509-certificate") ?: return null
            CertificateFactory.getInstance("X.509")
                .generateCertificate(ByteArrayInputStream(bytes)) as? X509Certificate
        } catch (_: Exception) {
            null
        }
    }

    private fun computeSpkiSha256(cert: X509Certificate): String? {
        return try {
            val spki = cert.publicKey.encoded
            val digest = MessageDigest.getInstance("SHA-256").digest(spki)
            android.util.Base64.encodeToString(digest, android.util.Base64.NO_WRAP)
        } catch (_: Exception) {
            null
        }
    }

    private fun reportMonitoringFailure(
        message: String,
        hostname: String?,
        url: String?,
        outcome: String,
        cause: Exception?,
    ) {
        val redactedUrl = url?.let {
            try {
                val uri = Uri.parse(it)
                uri.buildUpon().clearQuery().fragment(null).build().toString()
            } catch (_: Exception) {
                hostname
            }
        }

        val exception = cause ?: SSLPeerUnverifiedException(message)
        Sentry.captureException(exception) { scope ->
            scope.level = SentryLevel.WARNING
            hostname?.let { scope.setTag(CERTIFICATE_PINNING_HOST_TAG, it) }
            scope.setTag(CERTIFICATE_PINNING_MODE_TAG, if (enforcePinning) "enforce" else "monitor")
            scope.setTag(CERTIFICATE_PINNING_CHANNEL_TAG, "WebView")
            scope.setTag(CERTIFICATE_PINNING_OUTCOME_TAG, outcome)
            redactedUrl?.let { scope.setExtra("url", it) }
            if (cause != null) {
                scope.setExtra("monitoringFailureMessage", message)
            }
        }
    }

    private fun reportMismatch(
        hostname: String,
        url: String,
        actualChainHashes: List<String>,
        expectedHashes: Set<String>,
    ) {
        val redactedUrl = try {
            val uri = Uri.parse(url)
            uri.buildUpon().clearQuery().fragment(null).build().toString()
        } catch (_: Exception) {
            hostname
        }

        val message = "Certificate pinning validation failed for $hostname " +
            "(WebView chain SPKI hashes not in pinned set)"

        Sentry.captureException(SSLPeerUnverifiedException(message)) { scope ->
            scope.level = SentryLevel.WARNING
            scope.setTag(CERTIFICATE_PINNING_HOST_TAG, hostname)
            scope.setTag(CERTIFICATE_PINNING_MODE_TAG, if (enforcePinning) "enforce" else "monitor")
            scope.setTag(CERTIFICATE_PINNING_CHANNEL_TAG, "WebView")
            scope.setExtra("url", redactedUrl)
            scope.setExtra(
                "actualChainSpkiHashes",
                actualChainHashes.joinToString(", ") { "sha256/$it" },
            )
            scope.setExtra("expectedSpkiHashes", expectedHashes.joinToString(", ") { "sha256/$it" })
        }
    }
}
