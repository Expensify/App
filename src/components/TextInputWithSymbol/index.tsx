import React from 'react';
import type {NativeSyntheticEvent, TextInputSelectionChangeEventData} from 'react-native';
import type {BaseTextInputRef} from '@src/components/TextInput/BaseTextInput/types';
import BaseTextInputWithSymbol from './BaseTextInputWithSymbol';
import type {TextInputWithSymbolProps} from './types';

function TextInputWithSymbol({onSelectionChange = () => {}, ...props}: TextInputWithSymbolProps, ref: React.ForwardedRef<BaseTextInputRef>) {
    return (
        <BaseTextInputWithSymbol
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            onSelectionChange={(event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
                onSelectionChange(event.nativeEvent.selection.start, event.nativeEvent.selection.end);
            }}
        />
    );
}

TextInputWithSymbol.displayName = 'TextInputWithSymbol';

export default React.forwardRef(TextInputWithSymbol);
