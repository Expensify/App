import type {NumericSymbolProps} from '@components/NumericInput/types';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

/**
 * Renders the symbol (currency or unit) displayed beside the number. The composition decides what the symbol is, where
 * it sits, and whether it renders at all, so the primitive only renders the styled symbol and leaves layout to its
 * parent.
 */
function NumericSymbol({children, textStyle}: NumericSymbolProps) {
    const styles = useThemeStyles();

    return <Text style={[styles.iouAmountText, styles.lineHeightUndefined, textStyle]}>{children}</Text>;
}

export default NumericSymbol;
