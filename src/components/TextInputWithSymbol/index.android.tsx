import React, {useState} from 'react';
import type {TextInputSelectionChangeEvent} from 'react-native';
import BaseTextInputWithSymbol from './BaseTextInputWithSymbol';
import type {TextInputWithSymbolProps} from './types';

function TextInputWithSymbol({onSelectionChange = () => {}, ref, ...props}: TextInputWithSymbolProps) {
    const [acknowledgedAmount, setAcknowledgedAmount] = useState(props.formattedAmount);
    const skipNextSelectionChange = acknowledgedAmount !== props.formattedAmount;

    return (
        <BaseTextInputWithSymbol
            /* eslint-disable-next-line react/jsx-props-no-spreading */
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
