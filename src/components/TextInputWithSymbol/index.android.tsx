import React, {useEffect, useState} from 'react';
import type {TextInputSelectionChangeEvent} from 'react-native';
import BaseTextInputWithSymbol from './BaseTextInputWithSymbol';
import type {TextInputWithSymbolProps} from './types';

function TextInputWithSymbol({onSelectionChange = () => {}, ref, ...props}: TextInputWithSymbolProps) {
    const [skipNextSelectionChange, setSkipNextSelectionChange] = useState(false);

    useEffect(() => {
        setSkipNextSelectionChange(true);
    }, [props.formattedAmount]);

    return (
        <BaseTextInputWithSymbol
            /* eslint-disable-next-line react/jsx-props-no-spreading */
            {...props}
            ref={ref}
            onSelectionChange={(event: TextInputSelectionChangeEvent) => {
                if (skipNextSelectionChange) {
                    setSkipNextSelectionChange(false);
                    return;
                }
                onSelectionChange(event.nativeEvent.selection.start, event.nativeEvent.selection.end);
            }}
        />
    );
}

export default TextInputWithSymbol;
