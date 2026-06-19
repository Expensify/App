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
            // Each domain pins the leaf SPKI hash (primary) plus its issuing intermediate CA SPKI hash
            // (durable backup that survives leaf rotation). TrustKit requires at least two pins per domain.
            let groupAExpensifyCom = ["cSP5K9Slk59AgwZPst+dLPuNE+ZhypUlYRQNW1XC/fc=", "brzvtCELCIZUo4sD/qPX0ccRtPsd3DY6RfmxpOU9oB4="]
            let groupBNewExpensify = ["G2v6PWWl92F5vVHCtAYwScBHqNtPMkxb++SFoBJq5F4=", "kIdp6NNEd8wsugYyyIYFsi1ylMCED3hZbSR8ZFsa/A4="]
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
                    "www.expensify.com": domain(groupAExpensifyCom),
                    "secure.expensify.com": domain(groupAExpensifyCom),
                    "new.expensify.com": domain(groupBNewExpensify),
                    "integrations.expensify.com": domain(groupCIntegrations),
                    "travel.expensify.com": domain(groupDTravel),
                    "d2k5nsl2zxldvw.cloudfront.net": domain(groupECloudfront),
                    // Staging (beta/TestFlight release builds hit staging.* with __DEV__ === false)
                    "staging.expensify.com": domain(groupAExpensifyCom),
                    "staging-secure.expensify.com": domain(groupAExpensifyCom),
                    "staging.new.expensify.com": domain(groupBNewExpensify),
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

    private static func reportPinningFailure(hostname: String, evaluationResult: TSKPinningValidationResult) {
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
