#ifndef MOBILESDK_H
#define MOBILESDK_H

#import "GIBLogsHandler.h"
#import "GIBSessionListener.h"
#import "GIBNetworkListener.h"
#import "MobileSDKError.h"
#import "GIBAttribute.h"
#import "GIBAttributeFormat.h"
#import "GIBProxy.h"
#import <AppTrackingTransparency/AppTrackingTransparency.h>

typedef NS_ENUM(NSInteger, Capability);

#if TARGET_OS_IOS
#import <WebKit/WebKit.h>
//@import WebKit;
#endif

//! Project version number for MobileSdk.
FOUNDATION_EXPORT double MobileSdkVersionNumber;

//! Project version string for MobileSdk.
FOUNDATION_EXPORT const unsigned char MobileSdkVersionString[];

NS_ASSUME_NONNULL_BEGIN

typedef NS_ENUM(NSInteger, LocalStorageType) {
    OnlyLocalStorage NS_SWIFT_NAME(onlyLocalStorage),
    LocalStorageAndCookie NS_SWIFT_NAME(localStorageAndCookie)
};

@interface GIBMobileSDK : NSObject

/// The setCustomerId method sets the customer identifier issued by Group-IB. This method should be called before calling the run method.
/// @param customerID The customer's string ID in the format <vendor>-<channel>-<id>, where:
/// vendor - name of the vendor in the context of which the customer is identified and its ID must be unique;
/// channel-for iOS apps, it must be equal to "i";
/// channel-for tvOS apps, it must be equal to "i";
/// id - name of the customer in string format.
+ (void)setCustomerID:(NSString * _Nonnull)customerID;

/// The setTargetURL method sets the URL for sending data from the SDK. The value depends on the selected network communication scheme.
///
/// The setTargetURL method should be called before calling the run method.
/// @param url Full URL for sending data from the Mobile SDK.
+ (void)setTargetURL:(NSURL *)url;

/// The setLogURL method sets the URL for sending the SDK operation protocol.
/// @param logURL URL for sending Fraud Hunting Platform Mobile SDK operation protocols
/// @param error Double variable reference to return the error code
/// @result true — If execution is successful; false — If there is an error; error code can be obtained in the error variable
+ (BOOL)setLogURL:(NSURL * _Nonnull)logURL error:(NSError * _Nullable * _Nullable)error;

/// The setPublicKeysForPinning method sets a combination of public key values in PEM format that can be used for creating an SSL connection
///
/// The setPublicKeyForPinning method should be called before calling the run method.
/// @param publicKeys The array of valid public RSA keys in PEM format.
+ (void)setPublicKeysForPinning:(NSArray<NSString *> * _Nonnull)publicKeys;

/// The setPublicKeyForPinning method set a public key value in PEM format that can be used for creating an SSL connection
/// @param publicKey Valid public RSA keys in PEM format.
+ (void)setPublicKeyForPinning:(NSString * _Nonnull)publicKey;

/// The setPubKey method sets the customer's public RSA key, which will be used to encrypt user identifier and other parameters.
///
/// The setPubKey method should be called before calling the run method.
/// @param pubKey Public RSA key in PEM format.
/// @param error Double variable reference to return the error code
/// @result true — If execution is successful; false — If there is an error; error code can be obtained in the error variable
+ (BOOL)setPubKey:(NSString * _Nonnull)pubKey error:(NSError * _Nullable * _Nullable)error;

/// The setUserAgent method set a user-agent value for internal requests.
///
/// @param userAgent Non-null user agent value
+ (void)setUserAgent:(NSString * _Nonnull)userAgent;

/// The run method runs the Mobile SDK.
/// @param error Double variable reference to return the error code
/// @result true — If initialization is successful; false — If there is an error; the error code can be obtained in the error variable
+ (BOOL)run:(NSError * _Nullable * _Nullable)error;

/// The stop method terminates the Mobile SDK.
///
/// When the application is closed, the SDK will stop automatically.
+ (void)stop;

/// The setGIBLogsHandler method sets an instance of the class that implements the GIBLogsHandler interface to receive SDK log messages.
///
/// It can be used to send this data to the backend servers of the mobile application for running diagnostics using mechanisms of transferring mobile application operation protocols.
///
/// The setGIBLogsHandler method can be called either before or after calling the run method.
/// @param handler An instance of the class that implements the GIBLogsHandler interface
+ (void)setGIBLogsHandler:(id <GIBLogsHandler>)handler;

/// The enableDebugLogs method enables detailed logging of Mobile SDK operation in the console.
///
/// Logging will only work for debug variant of the app build.
///
/// Call the enableDebugLogs method in the test app build when sending it to Group-IB to verify the correctness of Mobile SDK integration - this will significantly reduce the testing time.
+ (void)enableDebugLogs;

/// The setLogin method allows to specify the current user identifier.
///
/// Before being sent to the server side of Fraud Hunting Platform, user identifier will be processed in parallel streams using:
///
/// - hash function SHA-1;
/// - encryption with public RSA key. If public RSA key is not set via the setPubKey method, user identifier value will only be sent as a hash.
/// @param login User ID in the mobile app
/// @param error Double variable reference to return the error code
/// @result true — If execution is successful; false — If there is an error; the error code can be obtained in the error variable
+ (BOOL)setLogin:(NSString * _Nonnull)login error:(NSError * _Nullable * _Nullable)error;

/// The setSessionId method sets the current session identifier. The parameter is not interpreted and is transmitted in its original form to the server side of Fraud Hunting Platform.
///
/// The setSessionId method can be called either before or after calling the run method, e.g when the user session starts in the mobile application after successful authentication.
///
/// The setSessionId method should be called after user successfully passes all stages of user authentication, including additional factors: SMS code, PIN code, etc. When user signs out of the personal account in the application or the application is forсed to sign user out (in case the sever finishes the user session due to timeout, user inactivity, etc.), the setSessionId method should transfer empty string "" to the sessionId parameter - this will be interpreted as the end of the user session.
/// @param sessionId Session identifier in the mobile app
/// @param error Double variable reference to return the error code
/// @result true — If execution is successful; false — If there is an error; the error code can be obtained in the error variable
+ (BOOL)setSessionId:(NSString * _Nonnull)sessionId error:(NSError * _Nullable * _Nullable)error;

+ (void)setAttribute:(NSString * _Nonnull)attribute forTitle:(NSString * _Nonnull)title error:(NSError * _Nullable * _Nullable)error __attribute__((unavailable("This method is deprecated. Use +setAttribute:error: method instead")));

+ (BOOL)setAttribute:(NSString * _Nonnull)attribute forTitle:(NSString * _Nonnull)title withFormat:(GIBAttributeFormat)format error:(NSError * _Nullable * _Nullable)error __attribute__((unavailable("This method is deprecated. Use +setAttribute:error: method instead")));

/// The setAttribute method is used to transmit additional attributes to Fraud Hunting Platform.
/// @param attribute GIBAttribute object
/// @param error Double variable reference to return the error code
/// @result true — If execution is successful; false — If there is an error; the error code can be obtained in the error variable
+ (BOOL)setAttribute:(GIBAttribute * _Nonnull)attribute error:(NSError * _Nullable * _Nullable)error;

+ (BOOL)setAttributes:(NSArray<GIBAttribute *>* _Nonnull)attributes error:(NSError * _Nullable * _Nullable)error;

/// The setSharedKeychainIdentifier is used to set KeychainIdentifier for share values between multiple apps of developer
/// @param identifier Valid identifier for Keychain group
+ (void)setSharedKeychainIdentifier:(NSString * _Nonnull)identifier;

/// The setCustomEvent method is used to transmit additional attributes to Fraud Hunting Platform.
/// @param event Event name
/// @param error Double variable reference to return the error code
/// @result true — If execution is successful; false — If there is an error; the error code can be obtained in the error variable
+ (BOOL)setCustomEvent:(NSString * _Nonnull)event error:(NSError * _Nullable * _Nullable)error;

/// The setSessionListener method sets an instance of a class that implements the GIBSessionListener interface for handling events that change the state of a Mobile SDK session.
/// @param listener Instance of the GIBSessionListener interface's successor class
+ (void)setSessionListener:(id <GIBSessionListener> _Nonnull)listener;

/// The setKeepAliveTimeout method sets the time interval (in seconds) for sending keepalive messages. Using the setKeepAliveTimeout method is required only if the module to block bot activity is enabled.
///
/// By default, sending keepalive messages is disabled. If a positive value is set, keepalive messages are sent only when more time than specified in the sec parameter has passed since the last data packet was sent from the Mobile SDK and the app is active (foreground).
/// @param sec Time in seconds between sending keepalive packets sent from the Mobile SDK
+ (void)setKeepAliveTimeout:(int)sec;
#if TARGET_OS_IOS

/// The initAppWebView method sets a WKWebView instance of the hybrid mobile application.
///
/// If Mobile SDK is initiated and its session is open, JavaScript module will start loading as part of the page loaded in the specified WebView. A more detailed scenario for using this method is described in <a href="https://fhwiki.group-ib.tech/Integration/hybrid_app/">Hybrid application</a>.
/// @param webView Instance of the WKWebView class of the hybrid mobile app
+ (void)initAppWebView:(WKWebView *)webView;
#endif

/// The getCookies method returns a set of cookie values
///
/// The getCookies method returns a set of cookie values that should be set for target requests from the mobile application for:
///
/// - protecting the Mobile API of the application from being used by bots and third-party applications;
/// - implementing adaptive authentication by analyzing the device using the Mobile SDK.
/// @result The combination of cookie names and values to be set in the target application request
+ (NSDictionary<NSString *, NSString*> * _Nullable)getCookies;

/// The enableCapability method initiates the SDK modules.
/// @param capability Module, which will be enabled
+ (BOOL)enableCapability:(Capability)capability;

/// The disableCapability method disables the SDK module.
/// @param capability Module, which will be disabled
+ (BOOL)disableCapability:(Capability)capability;

/// The setHeaderValue method sets value to the specified HTTP header.
///
/// Passing nil removes the value of the specified HTTP header.
/// @param value The value of the HTTP header.
/// @param key HTTP header name
+ (void)setHeaderValue:(NSString * _Nullable)value forKey:(NSString * _Nonnull)key;

+ (void)requestIDFAPermission:(void (^)(ATTrackingManagerAuthorizationStatus status))completion API_AVAILABLE(ios(14));

+ (void)setNetworkListener:(id <GIBNetworkListener>_Nonnull)listener;

+ (void)setURLsForCookies:(NSSet<NSURL *> *)urls;

+ (void)setWebSDKCookiesDomain:(NSSet<NSURL *> *)urls;

+ (void)setWebSDKSecureCookie:(BOOL)isSecureCookie;

+ (void)setWebSDKAttributesStorage:(LocalStorageType)attributesStorage;

+ (NSString *)getDeviceId;

@end

NS_ASSUME_NONNULL_END

#endif /* MOBILESDK_H */
