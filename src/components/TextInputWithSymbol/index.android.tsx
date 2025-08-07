import React, {useEffect, useState} from 'react';
import type {NativeSyntheticEvent, TextInputSelectionChangeEventData} from 'react-native';
import type {BaseTextInputRef} from '@src/components/TextInput/BaseTextInput/types';
import BaseTextInputWithSymbol from './BaseTextInputWithSymbol';
import type {TextInputWithSymbolProps} from './types';

function TextInputWithSymbol({onSelectionChange = () => {}, ...props}: TextInputWithSymbolProps, ref: React.ForwardedRef<BaseTextInputRef>) {
    const [skipNextSelectionChange, setSkipNextSelectionChange] = useState(false);

    useEffect(() => {
        setSkipNextSelectionChange(true);
    }, [props.formattedAmount]);

    return (
        <BaseTextInputWithSymbol
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

TextInputWithSymbol.displayName = 'TextInputWithSymbol';

export default React.forwardRef(TextInputWithSymbol);
