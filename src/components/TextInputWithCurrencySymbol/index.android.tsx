import React, {useEffect, useState} from 'react';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import BaseTextInputWithCurrencySymbol from './BaseTextInputWithCurrencySymbol';
import type {TextInputWithCurrencySymbolProps, TextInputWithCurrencySymbolPropsWithForwardedRef} from './types';

function TextInputWithCurrencySymbol({forwardedRef, onSelectionChange = () => {}, ...props}: TextInputWithCurrencySymbolPropsWithForwardedRef) {
    const [skipNextSelectionChange, setSkipNextSelectionChange] = useState(false);

    useEffect(() => {
        setSkipNextSelectionChange(true);
    }, [props.formattedAmount]);

    return (
        <BaseTextInputWithCurrencySymbol
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={forwardedRef}
            onSelectionChange={(e) => {
                if (skipNextSelectionChange) {
                    setSkipNextSelectionChange(false);
                    return;
                }
                onSelectionChange(e);
            }}
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
