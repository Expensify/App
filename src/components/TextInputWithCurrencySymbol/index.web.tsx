import React, {useRef} from 'react';
import type {NativeSyntheticEvent, TextInputSelectionChangeEventData} from 'react-native';
import BaseTextInputWithCurrencySymbol from './BaseTextInputWithCurrencySymbol';
import type {TextInputWithCurrencySymbolProps} from './types';

function TextInputWithCurrencySymbol({onSelectionChange = () => {}, ...props}: TextInputWithCurrencySymbolProps, ref: React.ForwardedRef<HTMLFormElement>) {
    const textInputRef = useRef<HTMLFormElement | null>(null);

    return (
        <BaseTextInputWithCurrencySymbol
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
            onSelectionChange={(event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
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

TextInputWithCurrencySymbol.displayName = 'TextInputWithCurrencySymbol';

export default React.forwardRef(TextInputWithCurrencySymbol);
