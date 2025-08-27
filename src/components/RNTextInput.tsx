import type {ForwardedRef} from 'react';
import React from 'react';
import type {TextInputProps} from 'react-native';
import {TextInput} from 'react-native';
import Animated from 'react-native-reanimated';
import useTheme from '@hooks/useTheme';
import type {FSClass} from '@libs/Fullstory/types';
import CONST from '@src/CONST';

// Convert the underlying TextInput into an Animated component so that we can take an animated ref and pass it to a worklet
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

type AnimatedTextInputRef = typeof AnimatedTextInput & TextInput & HTMLInputElement;

type RNTextInputWithRefProps = TextInputProps & {
    ref?: ForwardedRef<AnimatedTextInputRef>;
    fsClass?: FSClass;
};

function RNTextInputWithRef({ref, fsClass = CONST.FULLSTORY.CLASS.MASK, ...props}: RNTextInputWithRefProps) {
    const theme = useTheme();

    return (
        <AnimatedTextInput
            allowFontScaling={false}
            textBreakStrategy="simple"
            keyboardAppearance={theme.colorScheme}
            ref={(refHandle) => {
                if (typeof ref !== 'function') {
                    return;
                }
                ref(refHandle as AnimatedTextInputRef);
            }}
            fsClass={fsClass}
            // eslint-disable-next-line
            {...props}
        />
    );
}

RNTextInputWithRef.displayName = 'RNTextInputWithRef';

export default RNTextInputWithRef;
export type {AnimatedTextInputRef};
