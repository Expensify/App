import Foundation
import Security

// Error codes for Objective-C compatibility
@objc
public enum SecureStoreErrorCode: Int {
    case invalidKey = 1
    case authenticationFailed = 2
    case missingPlistKey = 3
    case secAccessControlError = 4
    case keychainError = 5
}

enum SecureStoreError: Error {
    case invalidKey
    case authenticationFailed
    case missingPlistKey
    case secAccessControlError(Int?)
    case keychainError(OSStatus)

    var localizedDescription: String {
        switch self {
        case .invalidKey:
            return "Invalid key"
        case .authenticationFailed:
            return "Authentication failed"
        case .missingPlistKey:
            return "You must set NSFaceIDUsageDescription in your Info.plist file to use the requireAuthentication option"
        case .secAccessControlError(let code):
            if let code = code {
                return "Unable to construct SecAccessControl: code \(code)"
            } else {
                return "Unable to construct SecAccessControl: unknown error"
            }
        case .keychainError(let status):
            return keychainErrorMessage(status)
        }
    }

    var nsError: NSError {
        return NSError(
            domain: "SecureStoreError",
            code: errorCode,
            userInfo: [NSLocalizedDescriptionKey: localizedDescription]
        )
    }

    private var errorCode: Int {
        switch self {
        case .invalidKey:
            return SecureStoreErrorCode.invalidKey.rawValue
        case .authenticationFailed:
            return SecureStoreErrorCode.authenticationFailed.rawValue
        case .missingPlistKey:
            return SecureStoreErrorCode.missingPlistKey.rawValue
        case .secAccessControlError(let code):
            return code ?? SecureStoreErrorCode.secAccessControlError.rawValue
        case .keychainError(let status):
            return Int(status)
        }
    }

    private func keychainErrorMessage(_ status: OSStatus) -> String {
        switch status {
        case errSecUnimplemented:
            return "Function or operation not implemented."
        case errSecIO:
            return "I/O error."
        case errSecOpWr:
            return "File already open with write permission."
        case errSecParam:
            return "One or more parameters passed to a function were not valid."
        case errSecAllocate:
            return "Failed to allocate memory."
        case errSecUserCanceled:
            return "User canceled the operation."
        case errSecBadReq:
            return "Bad parameter or invalid state for operation."
        case errSecNotAvailable:
            return "No keychain is available. You may need to restart your computer."
        case errSecDuplicateItem:
            return "The specified item already exists in the keychain."
        case errSecItemNotFound:
            return "The specified item could not be found in the keychain."
        case errSecInteractionNotAllowed:
            return "User interaction is not allowed."
        case errSecDecode:
            return "Unable to decode the provided data."
        case errSecAuthFailed:
            return "Authentication failed. Provided passphrase/PIN is incorrect or there is no user authentication method configured for this device."
        default:
            if let errorMessage = SecCopyErrorMessageString(status, nil) as? String {
                return errorMessage
            }
            return "Unknown Keychain Error."
        }
    }
}
