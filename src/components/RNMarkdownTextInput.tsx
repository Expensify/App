import type {MarkdownRange, MarkdownTextInputProps} from '@expensify/react-native-live-markdown';
import {MarkdownTextInput, parseExpensiMark} from '@expensify/react-native-live-markdown';
import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback} from 'react';
import Animated from 'react-native-reanimated';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useTheme from '@hooks/useTheme';
import CONST from '@src/CONST';

// Convert the underlying TextInput into an Animated component so that we can take an animated ref and pass it to a worklet
const AnimatedMarkdownTextInput = Animated.createAnimatedComponent(MarkdownTextInput);

type AnimatedMarkdownTextInputRef = typeof AnimatedMarkdownTextInput & MarkdownTextInput & HTMLInputElement;

// Make the parser prop optional for this component because we are always defaulting to `parseExpensiMark`
type RNMarkdownTextInputWithRefProps = Omit<MarkdownTextInputProps, 'parser'> & {
    parser?: MarkdownTextInputProps['parser'];
};

function decorateRangesWithCurrentUser(ranges: MarkdownRange[], text: string, currentUser: string): MarkdownRange[] {
    'worklet';

    return ranges.map((range) => {
        if (range.type === 'mention-user') {
            const mentionText = text.slice(range.start, range.start + range.length);
            const isCurrentUser = mentionText === `@${currentUser}`;
            if (isCurrentUser) {
                return {
                    ...range,
                    type: 'mention-here',
                };
            }
        }

        return range;
    });
}

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
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const currentUserLogin = currentUserPersonalDetails.login;

    // We accept parser passed down as a prop or use ExpensiMark if parser is not defined
    const parserWorklet = useCallback(
        (text: string) => {
            'worklet';

            if (parser) {
                return parser(text);
            }

            const parsedMentions = parseExpensiMark(text);
            if (!currentUserLogin) {
                return parsedMentions;
            }

            return decorateRangesWithCurrentUser(parsedMentions, text, currentUserLogin);
        },
        [currentUserLogin, parser],
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
export {decorateRangesWithCurrentUser};
export type {AnimatedMarkdownTextInputRef};
