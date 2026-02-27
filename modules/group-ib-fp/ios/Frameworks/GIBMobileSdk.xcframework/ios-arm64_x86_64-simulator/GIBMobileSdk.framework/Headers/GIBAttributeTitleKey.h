//
//  GIBAttributeTitleKey.h
//  GIBMobileSdk
//
//  Created by Mikhail Lutskiy on 30.09.2021.
//  Copyright © 2021 Group-IB. All rights reserved.
//

#import <Foundation/Foundation.h>

/// Standard attributes for all applications
typedef NSString * GIBAttributeTitleKey NS_TYPED_EXTENSIBLE_ENUM;

NS_ASSUME_NONNULL_BEGIN
/// User Identifier
FOUNDATION_EXPORT GIBAttributeTitleKey const GIBAttributeTitleUserId;
/// Phone number, starting with country code
FOUNDATION_EXPORT GIBAttributeTitleKey const GIBAttributeTitleMSISDN;
/// Email
FOUNDATION_EXPORT GIBAttributeTitleKey const GIBAttributeTitleEmail;
/// Operation identifier
FOUNDATION_EXPORT GIBAttributeTitleKey const GIBAttributeTitleRequestId;
/// Identifier of the company the user is associated with
FOUNDATION_EXPORT GIBAttributeTitleKey const GIBAttributeTitleCompanyId;
/// Country of account
///
/// String with Alpha-2 country code.
FOUNDATION_EXPORT GIBAttributeTitleKey const GIBAttributeTitleAccountCountry;
/// Promocode
FOUNDATION_EXPORT GIBAttributeTitleKey const GIBAttributeTitlePromoCode;
/// Other event (data entry, selection from a list in a form, etc.)
FOUNDATION_EXPORT GIBAttributeTitleKey const GIBAttributeTitleEventType;
/// Sender's masked card numbe
FOUNDATION_EXPORT GIBAttributeTitleKey const GIBAttributeTitleMaskedSenderCard;
/// Recipient's masked card number
FOUNDATION_EXPORT GIBAttributeTitleKey const GIBAttributeTitleMaskedRecipientCard;
/// Terminal number (for cases with multiple P2P/C2C pages)
FOUNDATION_EXPORT GIBAttributeTitleKey const GIBAttributeTitleTerminalNumber;
/// Transaction amount
FOUNDATION_EXPORT GIBAttributeTitleKey const GIBAttributeTitleTransactionSum;

NS_ASSUME_NONNULL_END
