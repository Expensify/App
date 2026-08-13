import blueThumbnail from '@assets/images/eReceiptBGs/ereceipt_thumbnail_blue.png';
import greenThumbnail from '@assets/images/eReceiptBGs/ereceipt_thumbnail_green.png';
import iceThumbnail from '@assets/images/eReceiptBGs/ereceipt_thumbnail_ice.png';
import pinkThumbnail from '@assets/images/eReceiptBGs/ereceipt_thumbnail_pink.png';
import tangerineThumbnail from '@assets/images/eReceiptBGs/ereceipt_thumbnail_tangerine.png';
import yellowThumbnail from '@assets/images/eReceiptBGs/ereceipt_thumbnail_yellow.png';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {Image, View} from 'react-native';

import type {TransactionListItemType} from './Search/SearchList/ListItem/types';

const eReceiptThumbnailSources = {
    [CONST.ERECEIPT_COLORS.YELLOW]: yellowThumbnail,
    [CONST.ERECEIPT_COLORS.ICE]: iceThumbnail,
    [CONST.ERECEIPT_COLORS.BLUE]: blueThumbnail,
    [CONST.ERECEIPT_COLORS.GREEN]: greenThumbnail,
    [CONST.ERECEIPT_COLORS.TANGERINE]: tangerineThumbnail,
    [CONST.ERECEIPT_COLORS.PINK]: pinkThumbnail,
};

type EReceiptStaticThumbnailProps = {
    transactionItem: TransactionListItemType | Transaction;
    style?: StyleProp<ViewStyle>;
};

function EReceiptStaticThumbnail({transactionItem, style}: EReceiptStaticThumbnailProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const colorCode = StyleUtils.getEReceiptColorCode(transactionItem);
    const source = eReceiptThumbnailSources[colorCode];

    return (
        <View style={[styles.flex1, style]}>
            <Image
                source={source}
                style={[styles.w100, styles.h100]}
                resizeMode="cover"
                accessibilityIgnoresInvertColors
            />
        </View>
    );
}

export default EReceiptStaticThumbnail;
