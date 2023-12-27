import React from 'react';
import type {TextInput} from 'react-native';
import BaseTextInputWithCurrencySymbol from './BaseTextInputWithCurrencySymbol';
import type TextInputWithCurrencySymbolProps from './types';

function TextInputWithCurrencySymbol(props: TextInputWithCurrencySymbolProps, ref: React.ForwardedRef<TextInput>) {
    return (
        <BaseTextInputWithCurrencySymbol
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
        />
    );
}

TextInputWithCurrencySymbol.displayName = 'TextInputWithCurrencySymbol';

export default React.forwardRef(TextInputWithCurrencySymbol);
