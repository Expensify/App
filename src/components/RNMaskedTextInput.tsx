import type {ForwardedRef} from 'react';
import React from 'react';
import {TextInput} from 'react-native';
import type {MaskedTextInputProps} from 'react-native-advanced-input-mask';
import {MaskedTextInput} from 'react-native-advanced-input-mask';
import Animated from 'react-native-reanimated';
import useTheme from '@hooks/useTheme';

// Convert the underlying TextInput into an Animated component so that we can take an animated ref and pass it to a worklet
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

type AnimatedTextInputRef = typeof AnimatedTextInput & TextInput & HTMLInputElement;

type RNMaskedTextInputWithRefProps = MaskedTextInputProps & {
    ref?: ForwardedRef<AnimatedTextInputRef>;
};

function RNMaskedTextInputWithRef({ref, ...props}: RNMaskedTextInputWithRefProps) {
    const theme = useTheme();

    return (
        <MaskedTextInput
            renderTextInputComponent={AnimatedTextInput}
            // disable autocomplete to prevent part of mask to be present on Android when value is empty
            autocomplete={false}
            allowFontScaling={false}
            textBreakStrategy="simple"
            keyboardAppearance={theme.colorScheme}
            ref={(refHandle) => {
                if (typeof ref !== 'function') {
                    return;
                }
                ref(refHandle as AnimatedTextInputRef | null);
            }}
            // eslint-disable-next-line
            {...props}
        />
    );
}

RNMaskedTextInputWithRef.displayName = 'RNMaskedTextInputWithRef';

export default RNMaskedTextInputWithRef;
