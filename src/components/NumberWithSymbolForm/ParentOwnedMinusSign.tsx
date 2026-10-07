import {useNumericInputState} from '@components/NumericInput/context';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import type {StyleProp, TextStyle} from 'react-native';

import React from 'react';

type ParentOwnedMinusSignProps = {
    /** Whether the caller's amount is negative */
    isNegative: boolean;

    /** Style applied to the minus sign */
    style?: StyleProp<TextStyle>;
};

/**
 * Minus sign of a caller-owned sign. The root holds the magnitude only, so `NumericInput.MinusSign` has no sign to show; this
 * renders the caller's `isNegative` in the same place and with the same styles, scaled by the root's dynamic font size, whose
 * `symbol` counts this sign. Must be rendered inside the NumericInput root.
 */
function ParentOwnedMinusSign({isNegative, style}: ParentOwnedMinusSignProps) {
    const styles = useThemeStyles();
    const {dynamicAmountStyle} = useNumericInputState();

    if (!isNegative) {
        return null;
    }

    return <Text style={[styles.iouAmountText, style, dynamicAmountStyle]}>-</Text>;
}

export default ParentOwnedMinusSign;
