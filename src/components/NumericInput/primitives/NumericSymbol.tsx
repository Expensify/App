import {useNumericAmount} from '@components/NumericInput/context';
import type {NumericSymbolProps} from '@components/NumericInput/types';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import {useLayoutEffect} from 'react';

/** Renders the symbol (currency or unit) displayed beside the number, leaving placement to the parent composition. */
function NumericSymbol({children, textStyle}: NumericSymbolProps) {
    const styles = useThemeStyles();
    const {dynamicAmountStyle, registerSymbolLength} = useNumericAmount();

    // The amount row sizes itself dynamically, so only symbols that are actually rendered count toward its length
    useLayoutEffect(() => registerSymbolLength(children.length), [children.length, registerSymbolLength]);

    return <Text style={[styles.iouAmountText, styles.lineHeightUndefined, textStyle, dynamicAmountStyle]}>{children}</Text>;
}

export default NumericSymbol;
