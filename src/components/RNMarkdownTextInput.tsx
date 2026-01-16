import type {MarkdownTextInputProps} from '@expensify/react-native-live-markdown';
import {MarkdownTextInput} from '@expensify/react-native-live-markdown';
import type {ForwardedRef} from 'react';
import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import Animated, {useSharedValue} from 'react-native-reanimated';
import useShortMentionsList from '@hooks/useShortMentionsList';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import toggleSelectionFormat from '@libs/FormatSelectionUtils';
import type {ForwardedFSClassProps} from '@libs/Fullstory/types';
import {parseExpensiMarkWithShortMentions} from '@libs/ParsingUtils';
import scheduleOnLiveMarkdownRuntime from '@libs/scheduleOnLiveMarkdownRuntime';
import CONST from '@src/CONST';

// Convert the underlying TextInput into an Animated component so that we can take an animated ref and pass it to a worklet
const AnimatedMarkdownTextInput = Animated.createAnimatedComponent(MarkdownTextInput);

type AnimatedMarkdownTextInputRef = typeof AnimatedMarkdownTextInput & MarkdownTextInput & HTMLInputElement;

// Make the parser prop optional for this component because we are always defaulting to `parseExpensiMark`
type RNMarkdownTextInputWithRefProps = Omit<MarkdownTextInputProps, 'parser'> &
    ForwardedFSClassProps & {
        parser?: MarkdownTextInputProps['parser'];
        ref?: ForwardedRef<AnimatedMarkdownTextInputRef>;
    };

function RNMarkdownTextInputWithRef({maxLength, parser, ref, forwardedFSClass = CONST.FULLSTORY.CLASS.UNMASK, ...props}: RNMarkdownTextInputWithRefProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    const {availableLoginsList, currentUserMentions} = useShortMentionsList();
    const mentionsSharedVal = useSharedValue<string[]>(availableLoginsList);
    const inputRef = useRef<AnimatedMarkdownTextInputRef>(null);

    // Expose the ref to the parent component
    React.useImperativeHandle<AnimatedMarkdownTextInputRef | null, AnimatedMarkdownTextInputRef | null>(ref, () => inputRef.current);

    // Check if the cursor is at the end of the text
    const isCursorAtEnd = props.selection && props.value && props.selection.start === props.value.length;

    // Automatically scroll to the end if the cursor was at the end after value changes
    useEffect(() => {
        if (!inputRef.current || !isCursorAtEnd) {
            return;
        }

        if ('scrollTop' in inputRef.current && 'scrollHeight' in inputRef.current) {
            const currentRef = inputRef.current as unknown as {scrollTop: number; scrollHeight: number};
            currentRef.scrollTop = currentRef.scrollHeight;
        }
    }, [props.value, isCursorAtEnd]);

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
        scheduleOnLiveMarkdownRuntime(() => {
            'worklet';

            mentionsSharedVal.set(availableLoginsList);
        });
    }, [availableLoginsList, mentionsSharedVal]);

    return (
        // We need this wrapper view in order to apply Fullstory masking since the Markdown input
        // only pass down specific props on Web. The 'display: "contents"' style is also applied
        // so the View won't interfere with the layout tree.
        <View
            style={styles.dContents}
            fsClass={forwardedFSClass}
        >
            <AnimatedMarkdownTextInput
                allowFontScaling={false}
                textBreakStrategy="simple"
                keyboardAppearance={theme.colorScheme}
                parser={parserWorklet}
                ref={inputRef}
                formatSelection={toggleSelectionFormat}
                // eslint-disable-next-line react/forbid-component-props
                fsClass={forwardedFSClass}
                // eslint-disable-next-line
                {...props}
                /**
                 * If maxLength is not set, we should set it to CONST.MAX_COMMENT_LENGTH + 1, to avoid parsing markdown for large text
                 */
                maxLength={maxLength ?? CONST.MAX_COMMENT_LENGTH + 1}
            />
        </View>
    );
}

export default RNMarkdownTextInputWithRef;
export type {AnimatedMarkdownTextInputRef};
