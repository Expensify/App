import type {MarkdownTextInputProps} from '@expensify/react-native-live-markdown';
import {MarkdownTextInput} from '@expensify/react-native-live-markdown';
import type {ForwardedRef} from 'react';
import React from 'react';
import type {TextInput} from 'react-native';
import Animated from 'react-native-reanimated';
import useTheme from '@hooks/useTheme';
import CONST from '@src/CONST';

// Convert the underlying TextInput into an Animated component so that we can take an animated ref and pass it to a worklet
const AnimatedMarkdownTextInput = Animated.createAnimatedComponent(MarkdownTextInput);

type AnimatedMarkdownTextInputRef = typeof AnimatedMarkdownTextInput & TextInput & HTMLInputElement;

function RNMarkdownTextInputWithRef({maxLength, ...props}: MarkdownTextInputProps, ref: ForwardedRef<AnimatedMarkdownTextInputRef>) {
    const theme = useTheme();

    return (
        <AnimatedMarkdownTextInput
            allowFontScaling={false}
            textBreakStrategy="simple"
            keyboardAppearance={theme.colorScheme}
            ref={(refHandle) => {
                if (typeof ref !== 'function') {
                    return;
                }
                ref(refHandle as AnimatedMarkdownTextInputRef);
            }}
            // eslint-disable-next-line
            {...props}
            /**
             * If maxLength is not set, we should set the it to CONST.MAX_COMMENT_LENGTH + 1, to avoid parsing markdown for large text
             * Since we want the ExceededCommentLength to be displayed, we need to set the maxLength to CONST.MAX_COMMENT_LENGTH + 1
             */
            maxLength={maxLength ?? CONST.MAX_COMMENT_LENGTH + 1}
        />
    );
}

RNMarkdownTextInputWithRef.displayName = 'RNTextInputWithRef';

export default React.forwardRef(RNMarkdownTextInputWithRef);
export type {AnimatedMarkdownTextInputRef};
