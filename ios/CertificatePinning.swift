//
//  CertificatePinning.swift
//  NewExpensify
//
//  Certificate pinning configuration (Iteration 1 - NewDot).
//
//  TrustKit is initialized with `kTSKSwizzleNetworkDelegates` so it automatically validates pins on
//  every NSURLSession delegate in the process. This covers fetch(), react-native-blob-util, and
//  any other URLSession-based networking without per-call changes.
//
//  NOTE: WKWebView runs out-of-process and is NOT covered by swizzling - WebView pinning is handled
//  separately (see the WebView pinning work in Iteration 1).
//
//  Keep the hashes in sync with config/certificatePinning/pins.json,
//  android/app/src/main/res/xml/network_security_config_enforce.xml, and CertificatePinning.kt.
//  Regenerate via scripts/generateCertificatePins.sh.
//

import Foundation
import Sentry
import TrustKit

enum CertificatePinning {
    /// When false, pin mismatches are reported to Sentry but connections are not blocked.
    /// Flip to true after 1-2 weeks of monitor-only data shows ~0 false positives.
    /// Keep in sync with `enforcePinning` in config/certificatePinning/pins.json and CertificatePinning.kt.
    private static let enforcePinning = false

    private static let certificatePinningHostTag = "certificate_pinning_host"
    private static let certificatePinningModeTag = "certificate_pinning_mode"

    /// Initialize TrustKit pinning. Must be called before any networking in `didFinishLaunchingWithOptions`.
    /// Pinning is disabled in DEBUG builds so local dev servers and debugging proxies keep working.
    static func initialize() {
        #if DEBUG
            return
        #else
            // Cloudflare-fronted expensify.com hosts (Groups A & B): Cloudflare can rotate the edge
            // cert between Let's Encrypt, Google Trust Services and SSL.com without notice (the
            // 2026-07-07 Let's Encrypt -> GTS rotation broke us; www has since reverted to Let's
            // Encrypt). To survive leaf rotation, intermediate rotation AND a CA switch without an
            // emergency release, we pin the SPKI of the ROOT of all three CAs plus each live issuing
            // intermediate. Regenerate via scripts/generateCertificatePins.sh.
            let cloudflareExpensify = [
                // Let's Encrypt (live CA for these hosts)
                "C5+lpZ7tcVwmwQIMcRtPbsQtWLABXhQzejna0wHFr8M=", // ISRG Root X1
                "diGVwiVYbubAI3RW4hB9xU8e/CH2GnkuvVFZE8zmgzI=", // ISRG Root X2
                "brzvtCELCIZUo4sD/qPX0ccRtPsd3DY6RfmxpOU9oB4=", // Let's Encrypt YE1 intermediate
                // Google Trust Services (backup)
                "hxqRlPTu1bMS/0DITB1SSu0vd4u/8l8TjPgfaAp63Gc=", // GTS Root R1
                "Vfd95BwDeSQo+NUYxVEEIlvkOlWY2SalKK1lPhzOx78=", // GTS Root R2
                "QXnt2YHvdHR3tJYmQIr0Paosp6t/nggsEGD4QJZ3Q0g=", // GTS Root R3
                "mEflZT5enoR1FuXLgYYGqnVEoZvmf9c2bVBpiOjYQ0c=", // GTS Root R4
                "kIdp6NNEd8wsugYyyIYFsi1ylMCED3hZbSR8ZFsa/A4=", // Google Trust Services WE1 intermediate
                // SSL.com (backup)
                "G/ANXI8TwJTdF+AFBM8IiIUPEv0Gf6H5LA/b9guG4yE=", // SSL.com TLS ECC Root CA 2022
                "K89VOmb1cJAN3TK6bf4ezAbJGC1mLcG2Dh97dnwr3VQ=", // SSL.com TLS RSA Root CA 2022
            ]
            let groupCIntegrations = ["7D0dEgdEKEMYRTgVwvnhJv19B4apk0QM/GPnRAKRGUs=", "AlSQhgtJirc8ahLyekmtX+Iw+v46yPYRLJt9Cq1GlB0="]
            let groupDTravel = ["Qb3qmTdRt/xHEN5PVtn+YhKoGqF/lhRX88cSFuSCJqM=", "kIdp6NNEd8wsugYyyIYFsi1ylMCED3hZbSR8ZFsa/A4="]
            let groupECloudfront = ["P9HBoLji8YncXSnb0AnAm72fJO/vpmxZrsl4fvUBkxc=", "DxH4tt40L+eduF6szpY6TONlxhZhBd+pJ9wbHlQ2fuw="]

            func domain(_ hashes: [String]) -> [String: Any] {
                return [
                    kTSKEnforcePinning: enforcePinning,
                    kTSKIncludeSubdomains: false,
                    kTSKPublicKeyHashes: hashes,
                ]
            }

            let trustKitConfig: [String: Any] = [
                kTSKSwizzleNetworkDelegates: true,
                kTSKPinnedDomains: [
                    // Production
                    "www.expensify.com": domain(cloudflareExpensify),
                    "secure.expensify.com": domain(cloudflareExpensify),
                    "new.expensify.com": domain(cloudflareExpensify),
                    "integrations.expensify.com": domain(groupCIntegrations),
                    "travel.expensify.com": domain(groupDTravel),
                    "d2k5nsl2zxldvw.cloudfront.net": domain(groupECloudfront),
                    // Staging (beta/TestFlight release builds hit staging.* with __DEV__ === false)
                    "staging.expensify.com": domain(cloudflareExpensify),
                    "staging-secure.expensify.com": domain(cloudflareExpensify),
                    "staging.new.expensify.com": domain(cloudflareExpensify),
                    "staging.travel.expensify.com": domain(groupDTravel),
                ],
            ]

            TrustKit.initSharedInstance(withConfiguration: trustKitConfig)

            TrustKit.sharedInstance().pinningValidatorCallback = { result, hostname, _ in
                guard result.evaluationResult != .success else {
                    return
                }
                reportPinningFailure(hostname: hostname, evaluationResult: result.evaluationResult)
            }
        #endif
    }

    private static func reportPinningFailure(hostname: String, evaluationResult: TSKTrustEvaluationResult) {
        let error = NSError(
            domain: "CertificatePinning",
            code: evaluationResult.rawValue,
            userInfo: [NSLocalizedDescriptionKey: "Certificate pinning validation failed for \(hostname)"]
        )

        SentrySDK.capture(error: error) { scope in
            scope.setTag(value: hostname, key: certificatePinningHostTag)
            scope.setTag(value: enforcePinning ? "enforce" : "monitor", key: certificatePinningModeTag)
            scope.setFingerprint(["certificate-pinning", hostname])
        }
    }
}
