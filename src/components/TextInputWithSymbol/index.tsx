import type {TextInputSelectionChangeEvent} from 'react-native';

import React from 'react';

import type {TextInputWithSymbolProps} from './types';

import BaseTextInputWithSymbol from './BaseTextInputWithSymbol';

/** @deprecated Use AmountFormField or KeypadAmountEditor instead. See contributingGuides/NUMBER_WITH_SYMBOL_FORM_MIGRATION.md. */
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
