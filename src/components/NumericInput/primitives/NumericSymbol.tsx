import type {NumericSymbolProps} from '@components/NumericInput/types';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

/** Renders the symbol (currency or unit) displayed beside the number, leaving placement to the parent composition. */
function NumericSymbol({children, textStyle}: NumericSymbolProps) {
    const styles = useThemeStyles();

    return <Text style={[styles.iouAmountText, styles.lineHeightUndefined, textStyle]}>{children}</Text>;
}

export default NumericSymbol;
