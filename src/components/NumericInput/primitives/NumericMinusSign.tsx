import {useNumericInputState} from '@components/NumericInput/context';
import type {NumericMinusSignProps} from '@components/NumericInput/types';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

/** Renders the sign separately from the editable numeric magnitude. */
function NumericMinusSign({style}: NumericMinusSignProps) {
    const styles = useThemeStyles();
    const {isNegative} = useNumericInputState();

    if (!isNegative) {
        return null;
    }

    return <Text style={[styles.iouAmountText, style]}>-</Text>;
}

export default NumericMinusSign;
