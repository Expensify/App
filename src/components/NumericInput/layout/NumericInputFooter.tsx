import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useThemeStyles from '@hooks/useThemeStyles';

import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';

import React from 'react';
import {View} from 'react-native';

import type {NumericInputLayoutSlotProps} from './types';

const canUseTouchScreen = canUseTouchScreenUtil();

/**
 * Full-width container for the submit CTA, below the body, centering its content. On touch screens it sits right under the
 * number pad, so it keeps a gap from the keys.
 * In two columns it sits outside the scroll view, so it adds the bottom spacing and the bottom safe area itself. In a single
 * column on touch screens the layout's scroll view owns the bottom spacing (the pad ends the body there), so the footer adds
 * none; without a touch screen there is no pad and the footer keeps its own bottom spacing.
 */
function NumericInputFooter({children, isTwoColumn, testID}: NumericInputLayoutSlotProps) {
    const styles = useThemeStyles();
    const ownsBottomSpacing = isTwoColumn || !canUseTouchScreen;
    const footerStyle = useBottomSafeSafeAreaPaddingStyle({
        addBottomSafeAreaPadding: isTwoColumn,
        style: [styles.w100, styles.alignItemsCenter, styles.ph5, canUseTouchScreen && styles.mt5, ownsBottomSpacing && styles.pb5],
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
