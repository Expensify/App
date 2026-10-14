import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useThemeStyles from '@hooks/useThemeStyles';

import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';

import React from 'react';
import {View} from 'react-native';

import type {NumericInputLayoutSlotProps} from './types';

const canUseTouchScreen = canUseTouchScreenUtil();

/** Full-width container for the submit CTA below the body. */
function NumericInputFooter({children, isTwoColumn, testID}: NumericInputLayoutSlotProps) {
    const styles = useThemeStyles();
    const ownsBottomSpacing = isTwoColumn || !canUseTouchScreen;
    const footerStyle = useBottomSafeSafeAreaPaddingStyle({
        // In landscape the footer sits outside the scroll view, so it handles the bottom safe area itself
        addBottomSafeAreaPadding: isTwoColumn,
        style: [styles.w100, styles.alignItemsCenter, styles.ph5, canUseTouchScreen && !isTwoColumn && styles.mt5, ownsBottomSpacing && styles.pb5],
    });

    return (
        <View
            testID={testID}
            style={footerStyle}
        >
            {children}
        </View>
    );
}

export default NumericInputFooter;
