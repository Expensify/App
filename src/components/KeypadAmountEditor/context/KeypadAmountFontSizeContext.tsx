import useStyleUtils from '@hooks/useStyleUtils';

import type {ReactNode} from 'react';
import type {TextStyle} from 'react-native';

import React, {createContext, useContext, useState} from 'react';

import {useKeypadAmountEditorState} from './KeypadAmountEditorContext';

type KeypadAmountFontSizeContextValue = {
    /** Dynamic font-size style calculated for the amount, symbol, and minus sign when scaling is enabled. */
    dynamicAmountStyle?: TextStyle;

    /** Counts a rendered symbol's length in the dynamic font size. Returns a function that stops counting it. */
    registerSymbolLength: (length: number) => () => void;
};

const KeypadAmountFontSizeContext = createContext<KeypadAmountFontSizeContextValue>({
    dynamicAmountStyle: undefined,
    registerSymbolLength: () => () => {},
});
KeypadAmountFontSizeContext.displayName = 'KeypadAmountEditor.FontSize';

function KeypadAmountFontSizeProvider({children}: {children: ReactNode}) {
    const [symbolLength, setSymbolLength] = useState(0);
    const StyleUtils = useStyleUtils();
    const {formattedNumber, isNegative, shouldUseDynamicFontSize} = useKeypadAmountEditorState();

    const dynamicAmountStyle = shouldUseDynamicFontSize ? StyleUtils.getAmountInputFontSize(formattedNumber.length + symbolLength + (isNegative ? 1 : 0)) : undefined;

    const value: KeypadAmountFontSizeContextValue = {
        dynamicAmountStyle,
        registerSymbolLength: (length) => {
            setSymbolLength((current) => current + length);
            return () => setSymbolLength((current) => current - length);
        },
    };

    return <KeypadAmountFontSizeContext.Provider value={value}>{children}</KeypadAmountFontSizeContext.Provider>;
}

function useKeypadAmountFontSize() {
    return useContext(KeypadAmountFontSizeContext);
}

export {KeypadAmountFontSizeProvider, useKeypadAmountFontSize};
