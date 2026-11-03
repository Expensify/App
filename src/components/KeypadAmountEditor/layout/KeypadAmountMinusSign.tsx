import {useKeypadAmountEditorState, useKeypadAmountFontSize} from '@components/KeypadAmountEditor/context';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

/** The minus sign of a negative value, which the input itself does not display because it holds the magnitude only. */
function KeypadAmountMinusSign() {
    const styles = useThemeStyles();
    const {isNegative} = useKeypadAmountEditorState();
    const {dynamicAmountStyle} = useKeypadAmountFontSize();

    if (!isNegative) {
        return null;
    }

    return <Text style={[styles.iouAmountText, dynamicAmountStyle]}>-</Text>;
}

export default KeypadAmountMinusSign;
