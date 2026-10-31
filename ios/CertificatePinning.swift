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

import CFNetwork
import CommonCrypto
import Foundation
import Network
import Security
import Sentry
import TrustKit

enum CertificatePinning {
    /// When false, pin mismatches are reported to Sentry but connections are not blocked.
    /// Flip to true after 1-2 weeks of monitor-only data shows ~0 false positives.
    /// Keep in sync with `enforcePinning` in config/certificatePinning/pins.json and CertificatePinning.kt.
    private static let enforcePinning = false

    /// Identifies the pin list a client shipped with, independent of the app version: the `_lastGenerated`
    /// value of config/certificatePinning/pins.json these hashes were copied from. Update it together with
    /// the hashes. Reported as `certificate_pinning_pin_set_version`.
    private static let pinSetVersion = "2026-09-14"

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
                // Google Trust Services (R2 stays pinned: device trust stores can still anchor at it, see pins.json)
                "hxqRlPTu1bMS/0DITB1SSu0vd4u/8l8TjPgfaAp63Gc=", // GTS Root R1
                "Vfd95BwDeSQo+NUYxVEEIlvkOlWY2SalKK1lPhzOx78=", // GTS Root R2
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

            // Reporting rebuilds the validated chain from TrustKit's PEM array and re-runs a trust
            // evaluation to classify the anchor, so it runs on its own serial queue rather than
            // TrustKit's default (main).
            TrustKit.sharedInstance().pinningValidatorCallbackQueue = reportingQueue
            TrustKit.sharedInstance().pinningValidatorCallback = { result, hostname, _ in
                guard result.evaluationResult != .success else {
                    return
                }
                reportPinningFailure(result: result, hostname: hostname)
            }
        #endif
    }

    // MARK: - Reporting
    //
    // TrustKit only says *that* a pin did not match; the attributes below record *what* iOS validated
    // (the full chain, the trust anchor, how the device trusts that anchor, and the network context) so
    // a mismatch in Sentry can be classified as a CA we do not pin versus a TLS-intercepting proxy
    // without a device in hand. Keep this set in sync with Mobile-Expensify's
    // iOS/Expensify/CertificatePinningReporter.m and the table in config/certificatePinning/README.md.
    //
    // Sentry's attribute converter matches Bool before Int, so any number holding 0 or 1 lands as a
    // boolean and the column type flaps between releases. Enum values are therefore strings, counts
    // that can be 0 or 1 are strings, real flags are Bool, and the validation duration is reported in
    // microseconds (never 0 or 1 in practice).

    /// Serial queue TrustKit invokes the callback on. Everything below that mutates static state runs here.
    private static let reportingQueue = DispatchQueue(label: "com.expensify.certificatePinning.reporting", qos: .utility)

    private static var occurrenceCounts: [String: Int] = [:]

    /// Tags are capped at 200 characters; these ride along as extras instead.
    private static let extraKeys: Set<String> = [
        "certificate_pinning_chain_subjects",
        "certificate_pinning_chain_fingerprints",
    ]
    private static var currentInterfaceType = "unknown"
    private static let pathMonitor: NWPathMonitor = {
        let monitor = NWPathMonitor()
        monitor.pathUpdateHandler = { path in
            if path.usesInterfaceType(.wifi) {
                currentInterfaceType = "wifi"
            } else if path.usesInterfaceType(.cellular) {
                currentInterfaceType = "cellular"
            } else if path.usesInterfaceType(.wiredEthernet) {
                currentInterfaceType = "wired"
            } else if path.usesInterfaceType(.other) {
                currentInterfaceType = "other" // VPN or tunnel
            } else {
                currentInterfaceType = "unknown"
            }
        }
        monitor.start(queue: reportingQueue)
        return monitor
    }()

    private static func reportPinningFailure(result: TSKPinningValidatorResult, hostname: String) {
        let chain = certificates(fromPEMChain: result.certificateChain)
        let subjects = chain.map(subjectSummary)
        let fingerprints = chain.map(fingerprint)
        let anchor = chain.last
        let anchorFingerprint = fingerprints.last ?? ""
        let (trustResult, trustErrors) = evaluate(chain, hostname: hostname)

        let resultName = name(of: result.evaluationResult)
        let dedupKey = "\(hostname)|\(anchorFingerprint)|\(resultName)"
        let occurrence = (occurrenceCounts[dedupKey] ?? 0) + 1
        occurrenceCounts[dedupKey] = occurrence

        var attributes: [String: Any] = [
            // Existing attributes, unchanged
            certificatePinningHostTag: hostname,
            certificatePinningModeTag: enforcePinning ? "enforce" : "monitor",
            // Typed replacement for the old numeric `certificate_pinning_evaluation_result`
            "certificate_pinning_result": resultName,
            "certificate_pinning_trust_decision": name(of: result.finalTrustDecision),
            "certificate_pinning_sec_trust_result": name(of: trustResult),
            // What iOS validated, leaf first
            "certificate_pinning_chain_length": String(chain.count),
            "certificate_pinning_chain_subjects": subjects.joined(separator: " > "),
            "certificate_pinning_chain_fingerprints": fingerprints.joined(separator: ","),
            "certificate_pinning_anchor_subject": subjects.last ?? "",
            "certificate_pinning_anchor_fingerprint": anchorFingerprint,
            "certificate_pinning_anchor_self_signed": anchor.map(isSelfSigned) ?? false,
            // Context
            "certificate_pinning_pin_set_version": pinSetVersion,
            "certificate_pinning_validation_duration_us": Int((result.validationDuration * 1_000_000).rounded()),
            "certificate_pinning_interface": interfaceType(),
            "certificate_pinning_occurrence": String(occurrence),
        ]
        attributes.merge(networkContext()) { current, _ in current }

        if !trustErrors.isEmpty {
            attributes["certificate_pinning_trust_errors"] = trustErrors
        }

        // One captured error per failed validation in both modes, exactly as before; the detail above
        // rides along as tags and extras.
        let error = NSError(
            domain: "CertificatePinning",
            code: result.evaluationResult.rawValue,
            userInfo: [NSLocalizedDescriptionKey: "Certificate pinning validation failed for \(hostname)"]
        )
        SentrySDK.capture(error: error) { scope in
            for (key, value) in attributes {
                if extraKeys.contains(key) {
                    scope.setExtra(value: value, key: key)
                } else {
                    scope.setTag(value: String(describing: value), key: key)
                }
            }
            scope.setFingerprint(["certificate-pinning", hostname])
        }
    }

    // MARK: Enum -> string (stable attribute types)

    private static func name(of result: TSKTrustEvaluationResult) -> String {
        switch result {
        case .success: return "success"
        case .failedNoMatchingPin: return "no_matching_pin"
        case .failedInvalidCertificateChain: return "invalid_certificate_chain"
        case .errorInvalidParameters: return "invalid_parameters"
        case .errorCouldNotGenerateSpkiHash: return "could_not_generate_spki_hash"
        default: return "unknown_\(result.rawValue)"
        }
    }

    private static func name(of decision: TSKTrustDecision) -> String {
        switch decision {
        case .shouldAllowConnection: return "allow"
        case .shouldBlockConnection: return "block"
        case .domainNotPinned: return "domain_not_pinned"
        default: return "unknown_\(decision.rawValue)"
        }
    }

    /// `proceed` means the anchor is explicitly trusted by the user or an MDM profile ("Enable Full Trust for
    /// Root Certificates"); `unspecified` means a system root with no user override. This is the cheapest
    /// single signal separating a TLS-intercepting proxy from a public CA we do not pin.
    private static func name(of result: SecTrustResultType) -> String {
        switch result {
        case .invalid: return "invalid"
        case .proceed: return "proceed"
        case .deny: return "deny"
        case .unspecified: return "unspecified"
        case .recoverableTrustFailure: return "recoverable_trust_failure"
        case .fatalTrustFailure: return "fatal_trust_failure"
        case .otherError: return "other_error"
        default: return "unknown_\(result.rawValue)"
        }
    }

    // MARK: Certificate helpers

    /// TrustKit builds `certificateChain` from the evaluated SecTrust, so it is leaf-first and includes the
    /// anchor whenever iOS found one.
    private static func certificates(fromPEMChain chain: [Any]) -> [SecCertificate] {
        chain.compactMap { entry in
            guard let pem = entry as? String else {
                return nil
            }
            let base64 = pem
                .replacingOccurrences(of: "-----BEGIN CERTIFICATE-----", with: "")
                .replacingOccurrences(of: "-----END CERTIFICATE-----", with: "")
            guard let der = Data(base64Encoded: base64, options: .ignoreUnknownCharacters), !der.isEmpty else {
                return nil
            }
            return SecCertificateCreateWithData(nil, der as CFData)
        }
    }

    /// SHA-256 of the DER certificate, upper-case hex, no colons. Strip the colons from a ROOT_MANIFEST entry
    /// in scripts/generateCertificatePins.sh and it is directly comparable.
    private static func fingerprint(_ certificate: SecCertificate) -> String {
        let der = SecCertificateCopyData(certificate) as Data
        var digest = [UInt8](repeating: 0, count: Int(CC_SHA256_DIGEST_LENGTH))
        der.withUnsafeBytes { buffer in
            _ = CC_SHA256(buffer.baseAddress, CC_LONG(der.count), &digest)
        }
        return digest.map { String(format: "%02X", $0) }.joined()
    }

    private static func subjectSummary(_ certificate: SecCertificate) -> String {
        let summary = SecCertificateCopySubjectSummary(certificate) as String?
        return summary.flatMap { $0.isEmpty ? nil : $0 } ?? "<no subject>"
    }

    private static func isSelfSigned(_ certificate: SecCertificate) -> Bool {
        guard let subject = SecCertificateCopyNormalizedSubjectSequence(certificate) as Data?,
              let issuer = SecCertificateCopyNormalizedIssuerSequence(certificate) as Data? else {
            return false
        }
        return subject == issuer
    }

    /// Re-runs the system trust evaluation on the chain TrustKit validated. TrustKit 3.x does not expose the
    /// original SecTrust, so this is the only way to learn how the device classified the anchor
    /// (`SecTrustResultType`) and, for an untrusted chain, why ("expired", "not trusted", hostname mismatch...).
    /// Revocation checking is best-effort and may touch the network, which is why this never runs on the
    /// main queue.
    private static func evaluate(_ certificates: [SecCertificate], hostname: String) -> (SecTrustResultType, String) {
        guard !certificates.isEmpty else {
            return (.invalid, "")
        }
        let policy = SecPolicyCreateSSL(true, hostname as CFString)
        var createdTrust: SecTrust?
        guard SecTrustCreateWithCertificates(certificates as CFArray, policy, &createdTrust) == errSecSuccess,
              let trust = createdTrust else {
            return (.invalid, "")
        }

        var errors: [String] = []
        var evaluationError: CFError?
        _ = SecTrustEvaluateWithError(trust, &evaluationError)
        if let evaluationError {
            let description = (evaluationError as Error).localizedDescription
            if !description.isEmpty {
                errors.append(description)
            }
        }
        var trustResult = SecTrustResultType.invalid
        SecTrustGetTrustResult(trust, &trustResult)

        if let properties = SecTrustCopyProperties(trust) as? [[String: Any]] {
            for property in properties {
                if let message = property[kSecPropertyTypeError as String] as? String, !message.isEmpty, !errors.contains(message) {
                    errors.append(message)
                }
            }
        }
        return (trustResult, errors.joined(separator: " | "))
    }

    // MARK: Network context

    /// Presence only: never the proxy host or PAC URL, which would identify the customer's network. Per-interface
    /// settings under `__SCOPED__` reveal tunnels (utun/ipsec/ppp/tap), which is where per-app VPN and TLS
    /// inspection usually live.
    private static func networkContext() -> [String: Any] {
        let proxy = CFNetworkCopySystemProxySettings()?.takeRetainedValue() as? [String: Any] ?? [:]
        let httpProxy = (proxy[kCFNetworkProxiesHTTPEnable as String] as? Bool) ?? false
        let pac = (proxy[kCFNetworkProxiesProxyAutoConfigEnable as String] as? Bool) ?? false
        let scoped = proxy["__SCOPED__"] as? [String: Any] ?? [:]
        let tunnelPrefixes = ["utun", "tun", "tap", "ppp", "ipsec"]
        let tunnel = scoped.keys.contains { interface in tunnelPrefixes.contains { interface.hasPrefix($0) } }
        return [
            "certificate_pinning_http_proxy_configured": httpProxy,
            "certificate_pinning_pac_configured": pac,
            "certificate_pinning_vpn_interface_present": tunnel,
        ]
    }

    /// Current interface type, cached from a path monitor started on first use so the lookup stays synchronous.
    private static func interfaceType() -> String {
        _ = pathMonitor
        return currentInterfaceType
    }
}
