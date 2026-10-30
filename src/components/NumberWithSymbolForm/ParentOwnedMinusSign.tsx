import {useKeypadAmountFontSize} from '@components/KeypadAmountEditor/context';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import type {StyleProp, TextStyle} from 'react-native';

import React, {useLayoutEffect} from 'react';

type ParentOwnedMinusSignProps = {
    /** Whether the caller's amount is negative */
    isNegative: boolean;

    /** Style applied to the minus sign */
    style?: StyleProp<TextStyle>;
};

/**
 * Minus sign of a caller-owned sign. The root holds the magnitude only, so `KeypadAmountEditor.MinusSign` has no sign to show; this
 * renders the caller's `isNegative` in the same place and with the same styles, scaled by the root's dynamic font size, whose
 * length this sign registers while it is shown. Must be rendered inside the KeypadAmountEditor root.
 */
function ParentOwnedMinusSign({isNegative, style}: ParentOwnedMinusSignProps) {
    const styles = useThemeStyles();
    const {dynamicAmountStyle, registerSymbolLength} = useKeypadAmountFontSize();

    // The root holds the magnitude only, so its dynamic font size does not count this sign unless it registers itself like a symbol
    useLayoutEffect(() => {
        if (!isNegative) {
            return;
        }
        return registerSymbolLength(1);
    }, [isNegative, registerSymbolLength]);

    if (!isNegative) {
        return null;
    }

    return <Text style={[styles.iouAmountText, style, dynamicAmountStyle]}>-</Text>;
}

export default ParentOwnedMinusSign;
