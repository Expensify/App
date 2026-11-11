import {useKeypadAmountFontSize} from '@components/KeypadAmountEditor/context';
import type {KeypadAmountSymbolProps} from '@components/KeypadAmountEditor/types';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import {useLayoutEffect} from 'react';

/** Renders the symbol (currency or unit) displayed beside the number, leaving placement to the parent composition. */
function KeypadAmountSymbol({children, textStyle}: KeypadAmountSymbolProps) {
    const styles = useThemeStyles();
    const {dynamicAmountStyle, registerSymbolLength} = useKeypadAmountFontSize();

    // The amount row sizes itself dynamically, so only symbols that are actually rendered count toward its length
    useLayoutEffect(() => registerSymbolLength(children.length), [children.length, registerSymbolLength]);

    return <Text style={[styles.iouAmountText, styles.lineHeightUndefined, textStyle, dynamicAmountStyle]}>{children}</Text>;
}

export default KeypadAmountSymbol;
