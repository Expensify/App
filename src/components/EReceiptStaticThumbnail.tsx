import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {Image, View} from 'react-native';
import blueThumbnail from '@assets/images/eReceiptBGs/ereceipt_thumbnail_blue.png';
import greenThumbnail from '@assets/images/eReceiptBGs/ereceipt_thumbnail_green.png';
import iceThumbnail from '@assets/images/eReceiptBGs/ereceipt_thumbnail_ice.png';
import pinkThumbnail from '@assets/images/eReceiptBGs/ereceipt_thumbnail_pink.png';
import tangerineThumbnail from '@assets/images/eReceiptBGs/ereceipt_thumbnail_tangerine.png';
import yellowThumbnail from '@assets/images/eReceiptBGs/ereceipt_thumbnail_yellow.png';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const eReceiptThumbnailSources = {
    [CONST.ERECEIPT_COLORS.YELLOW]: yellowThumbnail,
    [CONST.ERECEIPT_COLORS.ICE]: iceThumbnail,
    [CONST.ERECEIPT_COLORS.BLUE]: blueThumbnail,
    [CONST.ERECEIPT_COLORS.GREEN]: greenThumbnail,
    [CONST.ERECEIPT_COLORS.TANGERINE]: tangerineThumbnail,
    [CONST.ERECEIPT_COLORS.PINK]: pinkThumbnail,
};

type EReceiptStaticThumbnailProps = {
    transactionID: string | undefined;
    style?: StyleProp<ViewStyle>;
};

function EReceiptStaticThumbnail({transactionID, style}: EReceiptStaticThumbnailProps) {
    const StyleUtils = useStyleUtils();
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`);
    const colorCode = StyleUtils.getEReceiptColorCode(transaction);
    const source = eReceiptThumbnailSources[colorCode];

    return (
        <View style={[{flex: 1}, style]}>
            <Image
                source={source}
                style={{width: '100%', height: '100%'}}
                resizeMode="cover"
                accessibilityIgnoresInvertColors
            />
        </View>
    );
}

export default EReceiptStaticThumbnail;
