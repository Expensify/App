package com.expensify.chat

import com.facebook.react.modules.network.OkHttpClientProvider
import okhttp3.CertificatePinner

/**
 * Certificate pinning for React Native's shared OkHttp client (Iteration 1 - NewDot).
 *
 * On Android, `react-native-blob-util` (authenticated attachment/receipt downloads) and React Native
 * networking (including `fetch()`) route through `OkHttpClientProvider.getOkHttpClient()`. Installing
 * an [OkHttpClientProvider] factory with an OkHttp [CertificatePinner] here pins that traffic.
 *
 * This does not replace network_security_config.xml, which covers HttpURLConnection/WebView/Glide.
 *
 * Keep the pins in sync with config/certificatePinning/pins.json,
 * android/app/src/main/res/xml/network_security_config.xml, and ios/CertificatePinning.swift.
 * Regenerate via scripts/generateCertificatePins.sh.
 */
object CertificatePinning {
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
            OkHttpClientProvider.createClientBuilder()
                .certificatePinner(certificatePinner)
                .build()
        }
    }
}
