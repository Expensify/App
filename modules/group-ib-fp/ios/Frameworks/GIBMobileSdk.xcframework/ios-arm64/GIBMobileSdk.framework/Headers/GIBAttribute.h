//
//  GIBAttribute.h
//  MobileSdk
//
//  Created by Isa Aliev on 17/07/2019.
//  Copyright © 2019 Group-IB. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "GIBAttributeFormat.h"
#import "GIBAttributeTitleKey.h"

NS_ASSUME_NONNULL_BEGIN

/// GIBAttribute class for create attribute object
@interface GIBAttribute: NSObject

/// Initialize attribute object with GIBAttributeFormatClearText format
/// @param title Attribute name
/// @param value Attribute value
/// @param isSendOnce if false attribute will send once
- (instancetype)initWithTitle:(GIBAttributeTitleKey)title andValue:(nonnull NSString *)value isSendOnce:(BOOL) isSendOnce;

/// Initialize attribute object with GIBAttributeFormatClearText format. Attribute will send in every packet
/// @param title Attribute name
/// @param value Attribute value
- (instancetype)initWithTitle:(GIBAttributeTitleKey)title andValue:(nonnull NSString *)value;

/// Initialize attribute object with custom format
/// @param title Attribute name
/// @param value Attribute value
/// @param format Attribute format
/// @param isSendOnce if false attribute will send once
- (instancetype)initWithTitle:(GIBAttributeTitleKey)title value:(nonnull NSString *)value andFormat:(GIBAttributeFormat)format isSendOnce:(BOOL) isSendOnce;

/// Initialize attribute object with custom format.  Attribute will send in every packet
/// @param title Attribute name
/// @param value Attribute value
/// @param format Attribute format
- (instancetype)initWithTitle:(GIBAttributeTitleKey)title value:(nonnull NSString *)value andFormat:(GIBAttributeFormat)format;

@end

NS_ASSUME_NONNULL_END
