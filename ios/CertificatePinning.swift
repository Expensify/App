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
            // Each domain pins ONLY the ROOT CA SPKI hashes of every CA that can issue its
            // certificate. Roots are the only durable pin target: leaves are re-keyed on every
            // renewal and every CA in play issues from a rotating pool of intermediates, both of
            // which have already broken leaf/intermediate pins in production (2026-07-07
            // Let's Encrypt -> GTS edge rotation, 2026-07 Amazon M01 -> M04 intermediate rotation).
            // TrustKit evaluates pins against the full validated chain (including the anchor), so
            // root pins match even though servers never send the root.

            // Groups A-D: Cloudflare-fronted expensify.com hosts. Cloudflare can rotate the edge
            // cert between Let's Encrypt, Google Trust Services and SSL.com without notice, and its
            // backup certificates (deployed automatically on a revocation or key compromise) can also
            // come from Sectigo, so the roots of all four CAs are pinned.
            let cloudflareExpensify = [
                // Let's Encrypt
                "C5+lpZ7tcVwmwQIMcRtPbsQtWLABXhQzejna0wHFr8M=", // ISRG Root X1
                "diGVwiVYbubAI3RW4hB9xU8e/CH2GnkuvVFZE8zmgzI=", // ISRG Root X2
                // Google Trust Services (GTS Root R2 is not pinned: Mozilla removed it from its root store in 2026)
                "hxqRlPTu1bMS/0DITB1SSu0vd4u/8l8TjPgfaAp63Gc=", // GTS Root R1
                "QXnt2YHvdHR3tJYmQIr0Paosp6t/nggsEGD4QJZ3Q0g=", // GTS Root R3
                "mEflZT5enoR1FuXLgYYGqnVEoZvmf9c2bVBpiOjYQ0c=", // GTS Root R4
                // SSL.com
                "G/ANXI8TwJTdF+AFBM8IiIUPEv0Gf6H5LA/b9guG4yE=", // SSL.com TLS ECC Root CA 2022
                "K89VOmb1cJAN3TK6bf4ezAbJGC1mLcG2Dh97dnwr3VQ=", // SSL.com TLS RSA Root CA 2022
                // Sectigo (Cloudflare backup certificates) - both of its public TLS hierarchies
                "x4QzPSC810K5/cMjb05Qm4k3Bw5zBn4lTdO/nEW/Td4=", // USERTrust RSA Certification Authority
                "ICGRfpgmOUXIWcQ/HXPLQTkFPEFPoDyjvH7ohhQpjzs=", // USERTrust ECC Certification Authority
                "Douxi77vs4G+Ib/BogbTFymEYq0QSFXwSgVCaZcI09Q=", // Sectigo Public Server Authentication Root R46
                "sLVjNUaFYfW7n6EtgBeEpjOlcnBdNPMrZDRF36iwBdE=", // Sectigo Public Server Authentication Root E46
            ]
            // Group E: CloudFront CDN. AWS documents the Amazon Trust Services roots as the only
            // stable pin targets for ACM-issued certificates.
            let cloudfront = [
                "++MBgDH5WGvL9Bcn5Be30cRcL0f5O+NyoXuWtQdX1aI=", // Amazon Root CA 1
                "f0KW/FtqTjs108NpYj42SrGvOB2PpxIVM8nWxjPqJGE=", // Amazon Root CA 2
                "NqvDJlas/GRcYbcWE8S/IceH9cq77kg0jVhZeAPXq8k=", // Amazon Root CA 3
                "9+ze1cZgR9KO1kZrVDxA4HQ6voHRCSVNz4RdTCx4U8U=", // Amazon Root CA 4
                "KwccWaCgrnaw6tsrrSO61FgLacNgG2MMLq8GE6+oP5I=", // Starfield Services Root CA G2
            ]

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
                    "integrations.expensify.com": domain(cloudflareExpensify),
                    "travel.expensify.com": domain(cloudflareExpensify),
                    "d2k5nsl2zxldvw.cloudfront.net": domain(cloudfront),
                    // Staging (beta/TestFlight release builds hit staging.* with __DEV__ === false)
                    "staging.expensify.com": domain(cloudflareExpensify),
                    "staging-secure.expensify.com": domain(cloudflareExpensify),
                    "staging.new.expensify.com": domain(cloudflareExpensify),
                    "staging.travel.expensify.com": domain(cloudflareExpensify),
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
