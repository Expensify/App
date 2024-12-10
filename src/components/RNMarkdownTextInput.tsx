import type {MarkdownTextInputProps} from '@expensify/react-native-live-markdown';
import {MarkdownTextInput, parseExpensiMark} from '@expensify/react-native-live-markdown';
import type {ForwardedRef} from 'react';
import React from 'react';
import type {TextInput} from 'react-native';
import Animated from 'react-native-reanimated';
import useTheme from '@hooks/useTheme';

// Convert the underlying TextInput into an Animated component so that we can take an animated ref and pass it to a worklet
const AnimatedMarkdownTextInput = Animated.createAnimatedComponent(MarkdownTextInput);

type AnimatedMarkdownTextInputRef = typeof AnimatedMarkdownTextInput & TextInput & HTMLInputElement;
// Make the parser prop optional for this component because we are always defaulting to `parseExpensiMark`
type RNMarkdownTextInputWithRefProps = Omit<MarkdownTextInputProps, 'parser'> & {
    parser?: MarkdownTextInputProps['parser'];
};

function RNMarkdownTextInputWithRef(props: RNMarkdownTextInputWithRefProps, ref: ForwardedRef<AnimatedMarkdownTextInputRef>) {
    const theme = useTheme();

    const {parser, ...restProps} = props;
    const parserFunction = parser ?? parseExpensiMark;

    return (
        <AnimatedMarkdownTextInput
            allowFontScaling={false}
            textBreakStrategy="simple"
            keyboardAppearance={theme.colorScheme}
            parser={parserFunction}
            ref={(refHandle) => {
                if (typeof ref !== 'function') {
                    return;
                }
                ref(refHandle as unknown as AnimatedMarkdownTextInputRef);
            }}
            // eslint-disable-next-line
            {...restProps}
        />
    );
}

RNMarkdownTextInputWithRef.displayName = 'RNTextInputWithRef';

export default React.forwardRef(RNMarkdownTextInputWithRef);
export type {AnimatedMarkdownTextInputRef};
