//
//  GIBSessionListener.h
//  MobileSdk
//
//  Created by Isa Aliev on 02/09/2019.
//  Copyright © 2019 Group-IB. All rights reserved.
//

#ifndef GIBSessionListener_h
#define GIBSessionListener_h

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

/// The GIBSessionListener protocol defines the interface to receive the events about changing the state of the Mobile SDK session. An instance of the successor class must be set by calling the setSessionListener method.
@protocol GIBSessionListener <NSObject>

/// The sessionDidOpenWithID method is called when the Mobile SDK session is opened - the first value of the cfids cookie received after calling the run method.
/// @param sessionId Identifier of the Mobile SDK session
- (void)sessionDidOpenWithID:(NSString *)sessionId;

- (void)sessionDidGetId:(NSString *)sessionId;

@end

NS_ASSUME_NONNULL_END

#endif /* GIBSessionListener_h */
