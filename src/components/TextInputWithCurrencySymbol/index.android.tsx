import React, {useEffect, useState} from 'react';
import type {NativeSyntheticEvent, TextInputSelectionChangeEventData} from 'react-native';
import type {BaseTextInputRef} from '@src/components/TextInput/BaseTextInput/types';
import BaseTextInputWithCurrencySymbol from './BaseTextInputWithCurrencySymbol';
import type {TextInputWithCurrencySymbolProps} from './types';

function TextInputWithCurrencySymbol({onSelectionChange = () => {}, ...props}: TextInputWithCurrencySymbolProps, ref: React.ForwardedRef<BaseTextInputRef>) {
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
                onSelectionChange(event.nativeEvent.selection.start, event.nativeEvent.selection.end);
            }}
        />
    );
}

TextInputWithCurrencySymbol.displayName = 'TextInputWithCurrencySymbol';

export default React.forwardRef(TextInputWithCurrencySymbol);
