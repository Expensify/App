import React, {ForwardedRef, useEffect} from 'react';
// eslint-disable-next-line no-restricted-imports
import {TextInput, TextInputProps} from 'react-native';
import Animated, {AnimatedProps} from 'react-native-reanimated';
import ComposerFocusManager from '@libs/ComposerFocusManager';

// Convert the underlying TextInput into an Animated component so that we can take an animated ref and pass it to a worklet
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RNTextInputWithRef(props: TextInputProps, ref: ForwardedRef<React.Component<AnimatedProps<TextInputProps>>>) {
    const inputRef = React.useRef<React.Component<AnimatedProps<TextInputProps>> | null>(null);

    useEffect(() => () => ComposerFocusManager.releaseElement(inputRef.current), []);

    return (
        <AnimatedTextInput
            allowFontScaling={false}
            textBreakStrategy="simple"
            ref={(refHandle) => {
                if (refHandle) {
                    inputRef.current = refHandle;
                }
                if (typeof ref !== 'function') {
                    return;
                }
                ref(refHandle);
            }}
            // eslint-disable-next-line
            {...props}
        />
    );
}

RNTextInputWithRef.displayName = 'RNTextInputWithRef';

export default React.forwardRef(RNTextInputWithRef);
