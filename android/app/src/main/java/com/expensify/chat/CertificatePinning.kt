package com.expensify.chat

import com.facebook.react.modules.network.OkHttpClientProvider
import io.sentry.Sentry
import io.sentry.SentryLevel
import okhttp3.CertificatePinner
import okhttp3.Interceptor
import okhttp3.Response
import javax.net.ssl.SSLPeerUnverifiedException

/**
 * Certificate pinning for React Native's shared OkHttp client (Iteration 1 - NewDot).
 *
 * On Android, `react-native-blob-util` (authenticated attachment/receipt downloads) and React Native
 * networking (including `fetch()`) route through `OkHttpClientProvider.getOkHttpClient()`. Installing
 * an [OkHttpClientProvider] factory with an OkHttp [CertificatePinner] here pins that traffic.
 *
 * When [ENFORCE_PINNING] is false, a monitor interceptor validates pins after each TLS handshake and
 * reports mismatches to Sentry without blocking the request. Android `<pin-set>` enforcement in
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

    private fun buildCertificatePinner(): CertificatePinner {
        return CertificatePinner.Builder()
            // Group A: leaf CN=expensify.com + Let's Encrypt YE1 intermediate
            .add("www.expensify.com", "sha256/cSP5K9Slk59AgwZPst+dLPuNE+ZhypUlYRQNW1XC/fc=", "sha256/brzvtCELCIZUo4sD/qPX0ccRtPsd3DY6RfmxpOU9oB4=")
            .add("secure.expensify.com", "sha256/cSP5K9Slk59AgwZPst+dLPuNE+ZhypUlYRQNW1XC/fc=", "sha256/brzvtCELCIZUo4sD/qPX0ccRtPsd3DY6RfmxpOU9oB4=")
            .add("staging.expensify.com", "sha256/cSP5K9Slk59AgwZPst+dLPuNE+ZhypUlYRQNW1XC/fc=", "sha256/brzvtCELCIZUo4sD/qPX0ccRtPsd3DY6RfmxpOU9oB4=")
            .add("staging-secure.expensify.com", "sha256/cSP5K9Slk59AgwZPst+dLPuNE+ZhypUlYRQNW1XC/fc=", "sha256/brzvtCELCIZUo4sD/qPX0ccRtPsd3DY6RfmxpOU9oB4=")
            // Group B: leaf CN=expensify.com + Google Trust Services WE1 intermediate
            .add("new.expensify.com", "sha256/G2v6PWWl92F5vVHCtAYwScBHqNtPMkxb++SFoBJq5F4=", "sha256/kIdp6NNEd8wsugYyyIYFsi1ylMCED3hZbSR8ZFsa/A4=")
            .add("staging.new.expensify.com", "sha256/G2v6PWWl92F5vVHCtAYwScBHqNtPMkxb++SFoBJq5F4=", "sha256/kIdp6NNEd8wsugYyyIYFsi1ylMCED3hZbSR8ZFsa/A4=")
            // Group C: integrations leaf + Let's Encrypt R13 intermediate
            .add("integrations.expensify.com", "sha256/7D0dEgdEKEMYRTgVwvnhJv19B4apk0QM/GPnRAKRGUs=", "sha256/AlSQhgtJirc8ahLyekmtX+Iw+v46yPYRLJt9Cq1GlB0=")
            // Group D: travel leaf + Google Trust Services WE1 intermediate
            .add("travel.expensify.com", "sha256/Qb3qmTdRt/xHEN5PVtn+YhKoGqF/lhRX88cSFuSCJqM=", "sha256/kIdp6NNEd8wsugYyyIYFsi1ylMCED3hZbSR8ZFsa/A4=")
            .add("staging.travel.expensify.com", "sha256/Qb3qmTdRt/xHEN5PVtn+YhKoGqF/lhRX88cSFuSCJqM=", "sha256/kIdp6NNEd8wsugYyyIYFsi1ylMCED3hZbSR8ZFsa/A4=")
            // Group E: CloudFront CDN leaf + Amazon RSA 2048 M01 intermediate
            .add("d2k5nsl2zxldvw.cloudfront.net", "sha256/P9HBoLji8YncXSnb0AnAm72fJO/vpmxZrsl4fvUBkxc=", "sha256/DxH4tt40L+eduF6szpY6TONlxhZhBd+pJ9wbHlQ2fuw=")
            .build()
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
    }

    /**
     * Strips query parameters from a URL so credentials (e.g. authToken) are never sent to Sentry.
     */
    private fun redactUrl(url: okhttp3.HttpUrl): String =
        url.newBuilder().query(null).fragment(null).build().toString()

    private fun reportPinningFailure(hostname: String, url: okhttp3.HttpUrl, message: String) {
        Sentry.captureException(SSLPeerUnverifiedException(message)) { scope ->
            scope.level = SentryLevel.WARNING
            scope.setTag(CERTIFICATE_PINNING_HOST_TAG, hostname)
            scope.setTag(CERTIFICATE_PINNING_MODE_TAG, if (ENFORCE_PINNING) "enforce" else "monitor")
            scope.setExtra("url", redactUrl(url))
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
                        message = error.message ?: "Certificate pinning validation failed",
                    )
                }
            }

            return response
        }
    }
}
