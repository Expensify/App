#ifndef MobileSDKError_h
#define MobileSDKError_h
#import <Foundation/Foundation.h>

extern NSErrorDomain const MobileSDKErrorDomain;
/// Error description
typedef NS_ERROR_ENUM(MobileSDKErrorDomain, MobileSdkError) {
    /// URL not correct. Currect example https://example.com
    BadInputURL,
    /// Public key not correct.
    BadInputPublicKey,
    /// Empty login is provided
    BadInputLogin,
    /// No Customer ID specified
    BadInputCustomerId,
    /// setLogin encryption failed
    EncryptionFailed,
    /// Error while starting MobileSdk
    BadSDKInitialization,
    InternalError
};

#endif /* MobileSDKError_h */
