import React from 'react';
import type {TextInputSelectionChangeEvent} from 'react-native';
import BaseTextInputWithSymbol from './BaseTextInputWithSymbol';
import type {TextInputWithSymbolProps} from './types';

function TextInputWithSymbol({onSelectionChange = () => {}, ref, ...props}: TextInputWithSymbolProps) {
    return (
        <BaseTextInputWithSymbol
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            onSelectionChange={(event: TextInputSelectionChangeEvent) => {
                onSelectionChange(event.nativeEvent.selection.start, event.nativeEvent.selection.end);
            }}
        />
    );
}

TextInputWithSymbol.displayName = 'TextInputWithSymbol';

export default TextInputWithSymbol;
