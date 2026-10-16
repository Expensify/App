import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type {TextInputSelectionChangeEvent} from 'react-native';

import React, {useRef} from 'react';

import type {TextInputWithSymbolProps} from './types';

import BaseTextInputWithSymbol from './BaseTextInputWithSymbol';

function TextInputWithSymbol({onSelectionChange = () => {}, ref, ...props}: TextInputWithSymbolProps) {
    const textInputRef = useRef<BaseTextInputRef | null>(null);

    return (
        <BaseTextInputWithSymbol
            {...props}
            ref={(element) => {
                textInputRef.current = element;

                if (!ref) {
                    return;
                }

                if (typeof ref === 'function') {
                    ref(element);
                    return;
                }

                // eslint-disable-next-line no-param-reassign
                ref.current = element;
            }}
            onSelectionChange={(event: TextInputSelectionChangeEvent) => {
                onSelectionChange(event.nativeEvent.selection.start, event.nativeEvent.selection.end);
            }}
            onPress={() => {
                const input = textInputRef.current;
                const selectionStart = input instanceof HTMLInputElement ? (input.selectionStart ?? 0) : 0;
                const selectionEnd = input instanceof HTMLInputElement ? (input.selectionEnd ?? 0) : 0;
                onSelectionChange(selectionStart, selectionEnd);
            }}
        />
    );
}

export default TextInputWithSymbol;
