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
import javax.net.ssl.SSLPeerUnverifiedException
import javax.net.ssl.TrustManagerFactory
import javax.net.ssl.X509TrustManager

/**
 * Monitors WebView SSL certificates against pinned SPKI hashes. Android WebView does not expose a
 * TLS authentication-challenge delegate like iOS WKWebView, so this class validates the certificate
 * returned by [WebView.getCertificate] after page load. It is invoked from a patch applied to
 * react-native-webview's [RNCWebViewClient.onPageFinished] via reflection (the library module
 * cannot directly depend on the app module).
 *
 * In monitor mode mismatches are reported to Sentry without blocking the page. In enforce mode the
 * platform's `<pin-set>` in network_security_config handles blocking; this class still reports for
 * telemetry.
 */
object WebViewCertificateMonitor {
    private const val TAG = "WebViewCertMonitor"
    private const val CERTIFICATE_PINNING_HOST_TAG = "certificate_pinning_host"
    private const val CERTIFICATE_PINNING_MODE_TAG = "certificate_pinning_mode"
    private const val CERTIFICATE_PINNING_CHANNEL_TAG = "certificate_pinning_channel"

    @Volatile
    private var initialized = false
    private var enforcePinning = false

    /** Domain → set of base64-encoded SHA-256 SPKI hashes (without the "sha256/" prefix). */
    private var pinnedDomains: Map<String, Set<String>> = emptyMap()

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
     * A pin is satisfied if ANY certificate in the validated chain (leaf, intermediate, or root) has
     * an SPKI hash present in the pin set — matching RFC 7469 semantics and OkHttp behaviour. Since
     * [WebView.getCertificate] only exposes the leaf, the full chain is rebuilt via
     * [X509TrustManagerExtensions.checkServerTrusted] using the system trust store.
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

        val leafHash = computeSpkiSha256(leafCert) ?: return
        if (leafHash in expectedHashes) return

        val chainHashes = buildChainHashes(leafCert, host)
        if (chainHashes.any { it in expectedHashes }) return

        reportMismatch(host, url, leafHash, expectedHashes)
    }

    /**
     * Builds the certificate chain from the leaf using the system trust manager and returns SPKI
     * hashes for all certificates beyond the leaf (intermediates and root). Returns an empty list
     * if chain building fails, falling back to leaf-only validation.
     */
    private fun buildChainHashes(leafCert: X509Certificate, host: String): List<String> {
        val extensions = trustManagerExtensions ?: return emptyList()
        return try {
            val authType = if (leafCert.publicKey.algorithm == "EC") "ECDHE_ECDSA" else "RSA"
            val fullChain = extensions.checkServerTrusted(
                arrayOf(leafCert),
                authType,
                host,
            )
            fullChain.drop(1).mapNotNull { computeSpkiSha256(it) }
        } catch (_: Exception) {
            emptyList()
        }
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

    private fun reportMismatch(
        hostname: String,
        url: String,
        actualHash: String,
        expectedHashes: Set<String>,
    ) {
        val redactedUrl = try {
            val uri = Uri.parse(url)
            uri.buildUpon().clearQuery().fragment(null).build().toString()
        } catch (_: Exception) {
            hostname
        }

        val message = "Certificate pinning validation failed for $hostname " +
            "(WebView leaf SPKI sha256/$actualHash not in pinned set)"

        Sentry.captureException(SSLPeerUnverifiedException(message)) { scope ->
            scope.level = SentryLevel.WARNING
            scope.setTag(CERTIFICATE_PINNING_HOST_TAG, hostname)
            scope.setTag(CERTIFICATE_PINNING_MODE_TAG, if (enforcePinning) "enforce" else "monitor")
            scope.setTag(CERTIFICATE_PINNING_CHANNEL_TAG, "WebView")
            scope.setExtra("url", redactedUrl)
            scope.setExtra("actualSpkiHash", "sha256/$actualHash")
            scope.setExtra("expectedSpkiHashes", expectedHashes.joinToString(", ") { "sha256/$it" })
        }
    }
}
