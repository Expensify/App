import {useNumericInputState} from '@components/NumericInput/context';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

/** The minus sign of a negative value, which the input itself does not display because it holds the magnitude only. */
function NumericInputMinusSign() {
    const styles = useThemeStyles();
    const {dynamicAmountStyle, isNegative} = useNumericInputState();

    if (!isNegative) {
        return null;
    }

    return <Text style={[styles.iouAmountText, dynamicAmountStyle]}>-</Text>;
}

export default NumericInputMinusSign;
