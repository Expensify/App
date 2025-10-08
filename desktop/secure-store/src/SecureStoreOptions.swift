import Foundation

@objc
public class SecureStoreOptions: NSObject {
    @objc public var authenticationPrompt: String?
    @objc public var keychainAccessible: SecureStoreAccessible
    @objc public var keychainService: String?
    @objc public var requireAuthentication: Bool
    @objc public var accessGroup: String?

    @objc
    public init(
        authenticationPrompt: String? = nil,
        keychainAccessible: SecureStoreAccessible = .whenUnlocked,
        keychainService: String? = nil,
        requireAuthentication: Bool = false,
        accessGroup: String? = nil
    ) {
        self.authenticationPrompt = authenticationPrompt
        self.keychainAccessible = keychainAccessible
        self.keychainService = keychainService
        self.requireAuthentication = requireAuthentication
        self.accessGroup = accessGroup
    }

    // Convenience initializer for Objective-C that provides default values
    @objc
    public static func defaultOptions() -> SecureStoreOptions {
        return SecureStoreOptions()
    }
}
