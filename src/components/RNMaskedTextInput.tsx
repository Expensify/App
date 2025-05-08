import type {ForwardedRef} from 'react';
import React from 'react';
import type {TextInput} from 'react-native';
import type {MaskedTextInputProps} from 'react-native-advanced-input-mask';
import {MaskedTextInput} from 'react-native-advanced-input-mask';
import Animated from 'react-native-reanimated';
import useTheme from '@hooks/useTheme';

// Convert the underlying TextInput into an Animated component so that we can take an animated ref and pass it to a worklet
const AnimatedTextInput = Animated.createAnimatedComponent(MaskedTextInput);

type AnimatedTextInputRef = typeof AnimatedTextInput & TextInput & HTMLInputElement;

function RNMaskedTextInputWithRef(props: MaskedTextInputProps, ref: ForwardedRef<AnimatedTextInputRef>) {
    const theme = useTheme();

    return (
        <AnimatedTextInput
            // disable autocomplete to prevent part of mask to be present on Android when value is empty
            autocomplete={false}
            allowFontScaling={false}
            textBreakStrategy="simple"
            keyboardAppearance={theme.colorScheme}
            ref={(refHandle) => {
                if (typeof ref !== 'function') {
                    return;
                }
                ref(refHandle as AnimatedTextInputRef);
            }}
            // eslint-disable-next-line
            {...props}
        />
    );
}

RNMaskedTextInputWithRef.displayName = 'RNMaskedTextInputWithRef';

export default React.forwardRef(RNMaskedTextInputWithRef);
