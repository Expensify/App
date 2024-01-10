import React from 'react';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import BaseTextInputWithCurrencySymbol from './BaseTextInputWithCurrencySymbol';
import type {TextInputWithCurrencySymbolProps, TextInputWithCurrencySymbolPropsWithForwardedRef} from './types';

function TextInputWithCurrencySymbol({forwardedRef, ...props}: TextInputWithCurrencySymbolPropsWithForwardedRef) {
    return (
        <BaseTextInputWithCurrencySymbol
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={forwardedRef}
        />
    );
}

TextInputWithCurrencySymbol.displayName = 'TextInputWithCurrencySymbol';

const TextInputWithCurrencySymbolWithRef = React.forwardRef((props: TextInputWithCurrencySymbolProps, ref: BaseTextInputRef) => (
    <TextInputWithCurrencySymbol
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

export default TextInputWithCurrencySymbolWithRef;
