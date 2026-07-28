import type {TextInputSelectionChangeEvent} from 'react-native';

import React from 'react';

import type {TextInputWithSymbolProps} from './types';

import BaseTextInputWithSymbol from './BaseTextInputWithSymbol';

function TextInputWithSymbol({onSelectionChange = () => {}, ref, ...props}: TextInputWithSymbolProps) {
    return (
        <BaseTextInputWithSymbol
            {...props}
            ref={ref}
            onSelectionChange={(event: TextInputSelectionChangeEvent) => {
                onSelectionChange(event.nativeEvent.selection.start, event.nativeEvent.selection.end);
            }}
        />
    );
}

export default TextInputWithSymbol;
