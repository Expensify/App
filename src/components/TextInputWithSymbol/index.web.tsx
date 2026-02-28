import React, {useRef} from 'react';
import type {TextInputSelectionChangeEvent} from 'react-native';
import BaseTextInputWithSymbol from './BaseTextInputWithSymbol';
import type {TextInputWithSymbolProps} from './types';

function TextInputWithSymbol({onSelectionChange = () => {}, ref, ...props}: TextInputWithSymbolProps) {
    const textInputRef = useRef<HTMLFormElement | null>(null);

    return (
        <BaseTextInputWithSymbol
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={(element) => {
                textInputRef.current = element as HTMLFormElement;

                if (!ref) {
                    return;
                }

                if (typeof ref === 'function') {
                    ref(element as HTMLFormElement);
                    return;
                }

                // eslint-disable-next-line no-param-reassign
                ref.current = element as HTMLFormElement;
            }}
            onSelectionChange={(event: TextInputSelectionChangeEvent) => {
                onSelectionChange(event.nativeEvent.selection.start, event.nativeEvent.selection.end);
            }}
            onPress={() => {
                const selectionStart = (textInputRef.current?.selectionStart as number) ?? 0;
                const selectionEnd = (textInputRef.current?.selectionEnd as number) ?? 0;
                onSelectionChange(selectionStart, selectionEnd);
            }}
        />
    );
}

export default TextInputWithSymbol;
