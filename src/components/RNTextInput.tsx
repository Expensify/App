import type {ForwardedRef} from 'react';
import React, {useRef} from 'react';
import type {TextInputProps} from 'react-native';
import {TextInput} from 'react-native';
import Animated from 'react-native-reanimated';
import useLandscapeOnBlurProxy from '@hooks/useLandscapeOnBlurProxy';
import useTheme from '@hooks/useTheme';
import type {ForwardedFSClassProps} from '@libs/Fullstory/types';
import CONST from '@src/CONST';

// Convert the underlying TextInput into an Animated component so that we can take an animated ref and pass it to a worklet
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

type AnimatedTextInputRef = typeof AnimatedTextInput & TextInput & HTMLInputElement;

type RNTextInputWithRefProps = TextInputProps &
    ForwardedFSClassProps & {
        ref?: ForwardedRef<AnimatedTextInputRef>;
    };

function RNTextInputWithRef({ref, forwardedFSClass = CONST.FULLSTORY.CLASS.UNMASK, ...props}: RNTextInputWithRefProps) {
    const theme = useTheme();
    const inputRef = useRef<AnimatedTextInputRef | null>(null);
    const handleBlur = useLandscapeOnBlurProxy(inputRef, props.onBlur);

    return (
        <AnimatedTextInput
            allowFontScaling={false}
            textBreakStrategy="simple"
            keyboardAppearance={theme.colorScheme}
            ref={(refHandle: AnimatedTextInputRef) => {
                inputRef.current = refHandle;
                if (typeof ref !== 'function') {
                    return;
                }
                ref(refHandle);
            }}
            // eslint-disable-next-line react/forbid-component-props
            fsClass={forwardedFSClass}
            // eslint-disable-next-line
            {...props}
            onBlur={handleBlur}
        />
    );
}

export default RNTextInputWithRef;
export type {AnimatedTextInputRef};
