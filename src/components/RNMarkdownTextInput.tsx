import type {MarkdownTextInputProps} from '@expensify/react-native-live-markdown';
import {MarkdownTextInput, parseExpensiMark} from '@expensify/react-native-live-markdown';
import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback, useEffect} from 'react';
import Animated, {useSharedValue} from 'react-native-reanimated';
import useShortMentionsList from '@hooks/useShortMentionsList';
import useTheme from '@hooks/useTheme';
import {decorateRangesWithShortMentions} from '@libs/ParsingUtils';
import CONST from '@src/CONST';

// Convert the underlying TextInput into an Animated component so that we can take an animated ref and pass it to a worklet
const AnimatedMarkdownTextInput = Animated.createAnimatedComponent(MarkdownTextInput);

type AnimatedMarkdownTextInputRef = typeof AnimatedMarkdownTextInput & MarkdownTextInput & HTMLInputElement;

// Make the parser prop optional for this component because we are always defaulting to `parseExpensiMark`
type RNMarkdownTextInputWithRefProps = Omit<MarkdownTextInputProps, 'parser'> & {
    parser?: MarkdownTextInputProps['parser'];
};

function handleFormatSelection(selectedText: string, formatCommand: string) {
    switch (formatCommand) {
        case 'formatBold':
            return `*${selectedText}*`;
        case 'formatItalic':
            return `_${selectedText}_`;
        default:
            return selectedText;
    }
}

function RNMarkdownTextInputWithRef({maxLength, parser, ...props}: RNMarkdownTextInputWithRefProps, ref: ForwardedRef<AnimatedMarkdownTextInputRef>) {
    const theme = useTheme();

    const {mentionsList, currentUserMention} = useShortMentionsList();
    const mentionsSharedVal = useSharedValue<string[]>([]);

    useEffect(() => {
        mentionsSharedVal.set(mentionsList);
    }, [mentionsList, mentionsSharedVal]);

    // We accept parser passed down as a prop or use ExpensiMark if parser is not defined
    const parserWorklet = useCallback(
        (text: string) => {
            'worklet';

            if (parser) {
                return parser(text);
            }

            const parsedMentions = parseExpensiMark(text);
            const availableMentions = mentionsSharedVal.get();
            if (availableMentions.length === 0) {
                return parsedMentions;
            }

            return decorateRangesWithShortMentions(parsedMentions, text, mentionsSharedVal.get(), currentUserMention);
        },
        [currentUserMention, mentionsSharedVal, parser],
    );

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
            formatSelection={handleFormatSelection}
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
