//
//  GIBLogsHandler.h
//  MobileSdk
//
//  Created by Isa Aliev on 31.10.2018.
//  Copyright © 2018 Group-IB. All rights reserved.
//

#ifndef GIBLogsHandler_h
#define GIBLogsHandler_h

#import <Foundation/Foundation.h>

typedef NS_ENUM(NSInteger, LogType);

/// The GIBLogsHandler protocol specifies the interface class for receiving Mobile SDK log messages.
///
/// It can be used to send this data to the backend servers of the mobile application in order to run diagnostics using mechanisms of transferring mobile application operation protocols. An instance of this class should be set using the setGIBLogHandler method of a MobileSdk instance.
@protocol GIBLogsHandler <NSObject>

/// The handleLog method specifies the method for processing incoming Mobile SDK log messages.
/// @param log Mobile SDK log message
/// @param moduleName Name of the source module of the Mobile SDK log message
/// @param type Log level
- (void)handleLog:(NSString * _Nonnull)log fromModule:(NSString * _Nonnull)moduleName withType:(LogType)type;

@end

#endif /* GIBLogsHandler_h */
