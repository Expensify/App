import React, {useEffect, useState} from 'react';
import type {NativeSyntheticEvent, TextInput, TextInputSelectionChangeEventData} from 'react-native';
import BaseTextInputWithCurrencySymbol from './BaseTextInputWithCurrencySymbol';
import type TextInputWithCurrencySymbolProps from './types';

function TextInputWithCurrencySymbol({onSelectionChange = () => {}, ...props}: TextInputWithCurrencySymbolProps, ref: React.ForwardedRef<TextInput>) {
    const [skipNextSelectionChange, setSkipNextSelectionChange] = useState(false);

    useEffect(() => {
        setSkipNextSelectionChange(true);
    }, [props.formattedAmount]);

    return (
        <BaseTextInputWithCurrencySymbol
            /* eslint-disable-next-line react/jsx-props-no-spreading */
            {...props}
            ref={ref}
            onSelectionChange={(event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
                if (skipNextSelectionChange) {
                    setSkipNextSelectionChange(false);
                    return;
                }
                onSelectionChange(event);
            }}
        />
    );
}

TextInputWithCurrencySymbol.displayName = 'TextInputWithCurrencySymbol';

export default React.forwardRef(TextInputWithCurrencySymbol);
