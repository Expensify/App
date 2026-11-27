import Foundation
import NitroModules

/// Receives the notification that every iOS pinning callback (TrustKit in the App and in Mobile-Expensify)
/// posts when it blocks a connection, and forwards it to JS. A notification keeps those callbacks free of
/// any dependency on this module. The name and userInfo keys are documented in
/// config/certificatePinning/README.md and must match the senders.
final class HybridCertificatePinningModule: HybridCertificatePinningModuleSpec {
    static let connectionBlockedNotification = Notification.Name("ExpensifyCertificatePinningConnectionBlocked")
    static let hostKey = "host"
    static let rootCertificateNameKey = "rootCertificateName"

    private var observer: NSObjectProtocol?

    public var memorySize: Int { MemoryLayout<HybridCertificatePinningModule>.size }

    func setConnectionBlockedListener(listener: @escaping (BlockedConnection) -> Void) throws {
        try removeConnectionBlockedListener()
        observer = NotificationCenter.default.addObserver(
            forName: Self.connectionBlockedNotification,
            object: nil,
            queue: nil
        ) { notification in
            guard let host = notification.userInfo?[Self.hostKey] as? String else {
                return
            }
            let rootCertificateName = notification.userInfo?[Self.rootCertificateNameKey] as? String
            listener(BlockedConnection(host: host, rootCertificateName: rootCertificateName))
        }
    }

    func removeConnectionBlockedListener() throws {
        guard let observer else {
            return
        }
        NotificationCenter.default.removeObserver(observer)
        self.observer = nil
    }

    deinit {
        if let observer {
            NotificationCenter.default.removeObserver(observer)
        }
    }
}
