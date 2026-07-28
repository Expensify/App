//
//  GIBProxy.h
//  GIBMobileSdk
//
//  Created by Mikhail Lutskiy on 13/07/2023.
//  Copyright © 2023 Group-IB. All rights reserved.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface GIBProxy : NSObject

+ (GIBProxy * _Nonnull)getInstance;

- (void)setURLSessionConfiguration:(NSURLSessionConfiguration *)configuration;

@end

NS_ASSUME_NONNULL_END
