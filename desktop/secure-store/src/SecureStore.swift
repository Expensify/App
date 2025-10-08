import Foundation
import Security
import LocalAuthentication

@objc
public class SecureStore: NSObject {

    // MARK: - Public Methods

    public func getSecret(key: String, options: SecureStoreOptions = SecureStoreOptions()) throws -> String? {
        guard let validatedKey = validate(key: key) else {
            throw SecureStoreError.invalidKey
        }

        // Try unauthenticated item first
        if let unauthenticatedItem = try searchKeychain(
            with: validatedKey,
            options: options,
            requireAuthentication: false
        ) {
            return String(data: unauthenticatedItem, encoding: .utf8)
        }

        // Try authenticated item
        if let authenticatedItem = try searchKeychain(
            with: validatedKey,
            options: options,
            requireAuthentication: true
        ) {
            return String(data: authenticatedItem, encoding: .utf8)
        }

        // Try legacy item (for backward compatibility)
        if let legacyItem = try searchKeychain(
            with: validatedKey,
            options: options,
            requireAuthentication: nil
        ) {
            return String(data: legacyItem, encoding: .utf8)
        }

        return nil
    }

    public func setSecret(key: String, value: String, options: SecureStoreOptions = SecureStoreOptions()) async throws {
        guard let validatedKey = validate(key: key) else {
            throw SecureStoreError.invalidKey
        }

        try await set(value: value, with: validatedKey, options: options)
    }

    public func deleteSecret(key: String, options: SecureStoreOptions = SecureStoreOptions()) throws {
        let noAuthSearchDictionary = query(
            with: key,
            options: options,
            requireAuthentication: false
        )
        let authSearchDictionary = query(
            with: key,
            options: options,
            requireAuthentication: true
        )
        let legacySearchDictionary = query(
            with: key,
            options: options,
            requireAuthentication: nil
        )

        SecItemDelete(legacySearchDictionary as CFDictionary)
        SecItemDelete(authSearchDictionary as CFDictionary)
        SecItemDelete(noAuthSearchDictionary as CFDictionary)
    }

    @objc
    public func canUseAuthentication() -> Bool {
        let context = LAContext()
        var error: NSError?
        // This checks for biometry OR device passcode/PIN
        let isAuthenticationSupported = context.canEvaluatePolicy(
            .deviceOwnerAuthentication,
            error: &error
        )

        if error != nil {
            return false
        }
        return isAuthenticationSupported
    }

    // MARK: - Objective-C Compatibility Methods

    @objc(getSecretWithKey:options:error:)
    public func getSecretObjC(key: String, options: SecureStoreOptions) throws -> NSString {
        if let result = try getSecret(key: key, options: options) {
            return result as NSString
        }
        // Return empty string to indicate "not found" since we can't return nil from throwing @objc method
        return ""
    }

    @objc(setSecretWithKey:value:options:completionHandler:)
    public func setSecretObjC(key: String, value: String, options: SecureStoreOptions, completionHandler: @escaping (NSError?) -> Void) {
        Task {
            do {
                try await setSecret(key: key, value: value, options: options)
                completionHandler(nil)
            } catch {
                let nsError = (error as? SecureStoreError)?.nsError ?? (error as NSError)
                completionHandler(nsError)
            }
        }
    }

    @objc(deleteSecretWithKey:options:error:)
    public func deleteSecretObjC(key: String, options: SecureStoreOptions) throws {
        try deleteSecret(key: key, options: options)
    }

    // MARK: - Private Methods

    private func askForAuth(prompt: String) async throws {
        let context = LAContext()
        context.localizedReason = prompt
        guard context.canEvaluatePolicy(.deviceOwnerAuthentication, error: nil) else {
            throw SecureStoreError.keychainError(errSecNotAvailable)
        }
        let result = try await context.evaluatePolicy(
            LAPolicy.deviceOwnerAuthentication,
            localizedReason: context.localizedReason
        )
        if !result {
            throw SecureStoreError.authenticationFailed
        }
    }

    private func set(value: String, with key: String, options: SecureStoreOptions) async throws {
        // Ask for authentication before setting if required
        if options.requireAuthentication {
            let prompt = options.authenticationPrompt ?? "Authenticate to store your secret"
            try await askForAuth(prompt: prompt)
        }


        try deleteSecret(key: key, options: options)


        var setItemQuery = query(
            with: key,
            options: options,
            requireAuthentication: options.requireAuthentication
        )

        guard let valueData = value.data(using: .utf8) else {
            throw SecureStoreError.keychainError(errSecParam)
        }
        setItemQuery[kSecValueData as String] = valueData

        let accessibility = attribute(with: options)

        if !options.requireAuthentication {
            setItemQuery[kSecAttrAccessible as String] = accessibility
        } else {
            // Check if NSFaceIDUsageDescription is present in Info.plist
            // (Required even when using device password/PIN as fallback)
            guard let _ = Bundle.main.infoDictionary?["NSFaceIDUsageDescription"] as? String else {
                throw SecureStoreError.missingPlistKey
            }

            var error: Unmanaged<CFError>?
            // .userPresence allows biometry OR device passcode/PIN as authentication
            guard let accessOptions = SecAccessControlCreateWithFlags(
                kCFAllocatorDefault,
                accessibility,
                .userPresence,
                &error
            ) else {
                let errorCode = error.map { CFErrorGetCode($0.takeRetainedValue()) }
                throw SecureStoreError.secAccessControlError(errorCode)
            }
            setItemQuery[kSecAttrAccessControl as String] = accessOptions
        }

        let status = SecItemAdd(setItemQuery as CFDictionary, nil)

        if status != errSecSuccess {
            throw SecureStoreError.keychainError(status)
        }
    }

    private func searchKeychain(
        with key: String,
        options: SecureStoreOptions,
        requireAuthentication: Bool?
    ) throws -> Data? {
        var query = query(
            with: key,
            options: options,
            requireAuthentication: requireAuthentication
        )

        query[kSecMatchLimit as String] = kSecMatchLimitOne
        query[kSecReturnData as String] = kCFBooleanTrue

        if let authPrompt = options.authenticationPrompt {
            query[kSecUseOperationPrompt as String] = authPrompt
        }

        var item: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &item)

        switch status {
        case errSecSuccess:
            guard let data = item as? Data else {
                return nil
            }
            return data
        case errSecItemNotFound:
            return nil
        default:
            throw SecureStoreError.keychainError(status)
        }
    }

    private func query(
        with key: String,
        options: SecureStoreOptions,
        requireAuthentication: Bool?
    ) -> [String: Any] {
        var service = options.keychainService ?? "app"
        if let requireAuthentication = requireAuthentication {
            service.append(":\(requireAuthentication ? "auth" : "no-auth")")
        }

        let encodedKey = Data(key.utf8)

        var query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrGeneric as String: encodedKey,
            kSecAttrAccount as String: encodedKey
        ]

        if let accessGroup = options.accessGroup {
            query[kSecAttrAccessGroup as String] = accessGroup
        }

        return query
    }

    private func attribute(with options: SecureStoreOptions) -> CFString {
        switch options.keychainAccessible {
        case .afterFirstUnlock:
            return kSecAttrAccessibleAfterFirstUnlock
        case .afterFirstUnlockThisDeviceOnly:
            return kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        case .always:
            return kSecAttrAccessibleAlways
        case .whenPasscodeSetThisDeviceOnly:
            return kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly
        case .whenUnlocked:
            return kSecAttrAccessibleWhenUnlocked
        case .alwaysThisDeviceOnly:
            return kSecAttrAccessibleAlwaysThisDeviceOnly
        case .whenUnlockedThisDeviceOnly:
            return kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        }
    }

    private func validate(key: String) -> String? {
        let trimmedKey = key.trimmingCharacters(in: .whitespaces)
        if trimmedKey.isEmpty {
            return nil
        }
        return key
    }
}
