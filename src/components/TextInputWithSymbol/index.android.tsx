import type {TextInputSelectionChangeEvent} from 'react-native';

import React, {useState} from 'react';

import type {TextInputWithSymbolProps} from './types';

import BaseTextInputWithSymbol from './BaseTextInputWithSymbol';

function TextInputWithSymbol({onSelectionChange = () => {}, ref, ...props}: TextInputWithSymbolProps) {
    const [acknowledgedAmount, setAcknowledgedAmount] = useState(props.formattedAmount);
    const skipNextSelectionChange = acknowledgedAmount !== props.formattedAmount;

    return (
        <BaseTextInputWithSymbol
            {...props}
            ref={ref}
            onSelectionChange={(event: TextInputSelectionChangeEvent) => {
                if (skipNextSelectionChange) {
                    setAcknowledgedAmount(props.formattedAmount);
                    return;
                }
                onSelectionChange(event.nativeEvent.selection.start, event.nativeEvent.selection.end);
            }}
        />
    );
}

export default TextInputWithSymbol;
