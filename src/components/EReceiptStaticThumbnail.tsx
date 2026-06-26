import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {Image, View} from 'react-native';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const eReceiptThumbnailSources = {
    [CONST.ERECEIPT_COLORS.YELLOW]: require('@assets/images/eReceiptBGs/ereceipt_thumbnail_yellow.png'),
    [CONST.ERECEIPT_COLORS.ICE]: require('@assets/images/eReceiptBGs/ereceipt_thumbnail_ice.png'),
    [CONST.ERECEIPT_COLORS.BLUE]: require('@assets/images/eReceiptBGs/ereceipt_thumbnail_blue.png'),
    [CONST.ERECEIPT_COLORS.GREEN]: require('@assets/images/eReceiptBGs/ereceipt_thumbnail_green.png'),
    [CONST.ERECEIPT_COLORS.TANGERINE]: require('@assets/images/eReceiptBGs/ereceipt_thumbnail_tangerine.png'),
    [CONST.ERECEIPT_COLORS.PINK]: require('@assets/images/eReceiptBGs/ereceipt_thumbnail_pink.png'),
} as const;

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
            />
        </View>
    );
}

export default EReceiptStaticThumbnail;
