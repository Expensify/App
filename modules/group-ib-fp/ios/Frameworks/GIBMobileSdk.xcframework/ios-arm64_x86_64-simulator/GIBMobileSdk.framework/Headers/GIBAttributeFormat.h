//
//  GIBAttributeFormat.h
//  MobileSdk
//
//  Created by Isa Aliev on 23/09/2019.
//  Copyright © 2019 Group-IB. All rights reserved.
//

#ifndef GIBAttributeFormat_h
#define GIBAttributeFormat_h

/// Specifies the transformations that the attribute value will undergo before being transmitted to the Fraud Hunting Platform
/// @Note <b>GIBAttributeFormatHashed</b> and <b>GIBAttributeFormatEncrypted</b> may used be both.
typedef NS_OPTIONS(NSInteger, GIBAttributeFormat) {
    /// Attribute vaue is transmitted in its original form
    GIBAttributeFormatClearText = (1 << 0),
    /// Attribute value is hashed using SHA-1 algorithm
    GIBAttributeFormatHashed = (1 << 1),
    /// Attribute value is encrypted using the public key specified when calling the <a href="https://fhwiki.group-ib.tech/Integration/ios_sdk/#setPubKey%20method">setPubKey method</a>
    GIBAttributeFormatEncrypted = (1 << 2)
};

#endif /* GIBAttributeFormat_h */
