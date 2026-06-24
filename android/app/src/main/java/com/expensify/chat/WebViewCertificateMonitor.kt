package com.expensify.chat

import android.net.http.SslCertificate
import android.net.Uri
import android.os.Build
import android.webkit.WebView
import io.sentry.Sentry
import io.sentry.SentryLevel
import java.io.ByteArrayInputStream
import java.security.MessageDigest
import java.security.cert.CertificateFactory
import java.security.cert.X509Certificate
import javax.net.ssl.SSLPeerUnverifiedException

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
        val x509 = extractX509Certificate(sslCertificate) ?: return

        val actualHash = computeSpkiSha256(x509) ?: return
        if (actualHash !in expectedHashes) {
            reportMismatch(host, url, actualHash, expectedHashes)
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
