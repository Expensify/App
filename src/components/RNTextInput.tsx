import type {Component, ForwardedRef} from 'react';
import React from 'react';
// eslint-disable-next-line no-restricted-imports
import type {TextInputProps} from 'react-native';
import {TextInput} from 'react-native';
import type {AnimatedProps} from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import useTheme from '@hooks/useTheme';
import type {InputElement} from '@libs/ComposerFocusManager';
import ComposerFocusManager from '@libs/ComposerFocusManager';

// Convert the underlying TextInput into an Animated component so that we can take an animated ref and pass it to a worklet
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

type AnimatedTextInputRef = typeof AnimatedTextInput & TextInput & HTMLInputElement;

function RNTextInputWithRef(props: TextInputProps, ref: ForwardedRef<AnimatedTextInputRef>) {
    const theme = useTheme();

    const inputRef = React.useRef<InputElement>(null);

    React.useEffect(() => () => ComposerFocusManager.releaseInput(inputRef.current), []);

    return (
        <AnimatedTextInput
            allowFontScaling={false}
            textBreakStrategy="simple"
            keyboardAppearance={theme.colorScheme}
            ref={(refHandle) => {
                if (refHandle) {
                    (inputRef.current as Component<AnimatedProps<TextInputProps>>) = refHandle;
                }
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

RNTextInputWithRef.displayName = 'RNTextInputWithRef';

export default React.forwardRef(RNTextInputWithRef);

export type {AnimatedTextInputRef};
