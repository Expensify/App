import type {MarkdownTextInputProps} from '@expensify/react-native-live-markdown';
import {MarkdownTextInput} from '@expensify/react-native-live-markdown';
import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback, useEffect} from 'react';
import Animated, {useSharedValue} from 'react-native-reanimated';
import useShortMentionsList from '@hooks/useShortMentionsList';
import useTheme from '@hooks/useTheme';
import toggleSelectionFormat from '@libs/FormatSelectionUtils';
import {parseExpensiMarkWithShortMentions} from '@libs/ParsingUtils';
import runOnLiveMarkdownRuntime from '@libs/runOnLiveMarkdownRuntime';
import CONST from '@src/CONST';

// Convert the underlying TextInput into an Animated component so that we can take an animated ref and pass it to a worklet
const AnimatedMarkdownTextInput = Animated.createAnimatedComponent(MarkdownTextInput);

type AnimatedMarkdownTextInputRef = typeof AnimatedMarkdownTextInput & MarkdownTextInput & HTMLInputElement;

// Make the parser prop optional for this component because we are always defaulting to `parseExpensiMark`
type RNMarkdownTextInputWithRefProps = Omit<MarkdownTextInputProps, 'parser'> & {
    parser?: MarkdownTextInputProps['parser'];
};

function RNMarkdownTextInputWithRef({maxLength, parser, ...props}: RNMarkdownTextInputWithRefProps, ref: ForwardedRef<AnimatedMarkdownTextInputRef>) {
    const theme = useTheme();

    const {mentionsList, currentUserMentions} = useShortMentionsList();
    const mentionsSharedVal = useSharedValue<string[]>(mentionsList);

    // If `parser` prop was passed down we use it directly, otherwise we default to parsing with ExpensiMark
    const parserWorklet = useCallback(
        (text: string) => {
            'worklet';

            if (parser) {
                return parser(text);
            }

            return parseExpensiMarkWithShortMentions(text, mentionsSharedVal.get(), currentUserMentions);
        },
        [currentUserMentions, mentionsSharedVal, parser],
    );

    useEffect(() => {
        runOnLiveMarkdownRuntime(() => {
            'worklet';

            mentionsSharedVal.set(mentionsList);
        })();
    }, [mentionsList, mentionsSharedVal]);

    return (
        <AnimatedMarkdownTextInput
            allowFontScaling={false}
            textBreakStrategy="simple"
            keyboardAppearance={theme.colorScheme}
            parser={parserWorklet}
            ref={(refHandle) => {
                if (typeof ref !== 'function') {
                    return;
                }
                ref(refHandle as AnimatedMarkdownTextInputRef);
            }}
            formatSelection={toggleSelectionFormat}
            // eslint-disable-next-line
            {...props}
            /**
             * If maxLength is not set, we should set it to CONST.MAX_COMMENT_LENGTH + 1, to avoid parsing markdown for large text
             */
            maxLength={maxLength ?? CONST.MAX_COMMENT_LENGTH + 1}
        />
    );
}

RNMarkdownTextInputWithRef.displayName = 'RNTextInputWithRef';

export default forwardRef(RNMarkdownTextInputWithRef);
export type {AnimatedMarkdownTextInputRef};
