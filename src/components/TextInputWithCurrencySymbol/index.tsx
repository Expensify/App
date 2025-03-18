import React from 'react';
import type {NativeSyntheticEvent, TextInputSelectionChangeEventData} from 'react-native';
import type {BaseTextInputRef} from '@src/components/TextInput/BaseTextInput/types';
import BaseTextInputWithCurrencySymbol from './BaseTextInputWithCurrencySymbol';
import type {TextInputWithCurrencySymbolProps} from './types';

function TextInputWithCurrencySymbol({onSelectionChange = () => {}, ...props}: TextInputWithCurrencySymbolProps, ref: React.ForwardedRef<BaseTextInputRef>) {
    return (
        <BaseTextInputWithCurrencySymbol
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            onSelectionChange={(event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
                onSelectionChange(event.nativeEvent.selection.start, event.nativeEvent.selection.end);
            }}
        />
    );
}

TextInputWithCurrencySymbol.displayName = 'TextInputWithCurrencySymbol';

export default React.forwardRef(TextInputWithCurrencySymbol);
