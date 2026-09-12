import {useNumericInputState} from '@components/NumericInput/context';

import useStyleUtils from '@hooks/useStyleUtils';

import type {TextStyle} from 'react-native';

/** Returns one font-size style for all pieces of a composed numeric input. */
function useNumericDynamicFontSize(symbol = ''): TextStyle {
    const StyleUtils = useStyleUtils();
    const {formattedNumber, isNegative} = useNumericInputState();

    return StyleUtils.getAmountInputFontSize(formattedNumber.length + symbol.length + (isNegative ? 1 : 0));
}

export default useNumericDynamicFontSize;
