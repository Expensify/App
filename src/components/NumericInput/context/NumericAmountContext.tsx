import useStyleUtils from '@hooks/useStyleUtils';

import type {ReactNode} from 'react';
import type {TextStyle} from 'react-native';

import React, {createContext, useContext, useState} from 'react';

import {useNumericInputState} from './NumericInputContext';

type NumericAmountContextValue = {
    /** Dynamic font-size style calculated for the amount, symbol, and minus sign when scaling is enabled. */
    dynamicAmountStyle?: TextStyle;

    /** Counts a rendered symbol's length in the dynamic font size. Returns a function that stops counting it. */
    registerSymbolLength: (length: number) => () => void;
};

const NumericAmountContext = createContext<NumericAmountContextValue>({
    dynamicAmountStyle: undefined,
    registerSymbolLength: () => () => {},
});
NumericAmountContext.displayName = 'NumericInput.Amount';

function NumericAmountProvider({children}: {children: ReactNode}) {
    const [symbolLength, setSymbolLength] = useState(0);
    const StyleUtils = useStyleUtils();
    const {formattedNumber, isNegative, shouldUseDynamicFontSize} = useNumericInputState();

    const dynamicAmountStyle = shouldUseDynamicFontSize ? StyleUtils.getAmountInputFontSize(formattedNumber.length + symbolLength + (isNegative ? 1 : 0)) : undefined;

    const value: NumericAmountContextValue = {
        dynamicAmountStyle,
        registerSymbolLength: (length) => {
            setSymbolLength((current) => current + length);
            return () => setSymbolLength((current) => current - length);
        },
    };

    return <NumericAmountContext.Provider value={value}>{children}</NumericAmountContext.Provider>;
}

function useNumericAmount() {
    return useContext(NumericAmountContext);
}

export {NumericAmountProvider, useNumericAmount};
