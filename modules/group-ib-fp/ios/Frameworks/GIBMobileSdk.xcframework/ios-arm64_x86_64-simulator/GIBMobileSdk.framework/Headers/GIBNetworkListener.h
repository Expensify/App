//
//  GIBNetworkListener.h
//  GIBMobileSdk
//
//  Created by Mikhail Lutskiy on 20/11/2023.
//  Copyright © 2023 Group-IB. All rights reserved.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@protocol GIBNetworkListener <NSObject>

- (void)networkDidFailedWithError:(NSError *)error andStatusCode:(NSInteger)statusCode;

@end

NS_ASSUME_NONNULL_END
