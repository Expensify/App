import type {MarkdownStyle} from '@expensify/react-native-live-markdown';
import {useMemo} from 'react';
import {containsOnlyEmojis} from '@libs/EmojiUtils';
import FontUtils from '@styles/utils/FontUtils';
import variables from '@styles/variables';
import useTheme from './useTheme';

const defaultEmptyArray: Array<keyof MarkdownStyle> = [];

function useMarkdownStyle(message: string | null = null, excludeStyles: Array<keyof MarkdownStyle> = defaultEmptyArray): MarkdownStyle {
    const theme = useTheme();
    const hasMessageOnlyEmojis = message != null && message.length > 0 && containsOnlyEmojis(message);
    const emojiFontSize = hasMessageOnlyEmojis ? variables.fontSizeOnlyEmojis : variables.fontSizeEmojisWithinText;

    // this map is used to reset the styles that are not needed - passing undefined value can break the native side
    const nonStylingDefaultValues: Record<string, string | number> = useMemo(
        () => ({
            color: theme.text,
            backgroundColor: 'transparent',
            marginLeft: 0,
            paddingLeft: 0,
            borderColor: 'transparent',
            borderWidth: 0,
        }),
        [theme],
    );

    const markdownStyle = useMemo(() => {
        const styling = {
            syntax: {
                color: theme.syntax,
            },
            link: {
                color: theme.link,
            },
            h1: {
                fontSize: variables.fontSizeLarge,
            },
            emoji: {
                fontSize: emojiFontSize,
                lineHeight: variables.lineHeightXLarge,
            },
            blockquote: {
                borderColor: theme.border,
                borderWidth: 4,
                marginLeft: 0,
                paddingLeft: 6,
                /**
                 * since blockquote has `inline-block` display -> padding-right is needed to prevent cursor overlapping
                 * with last character of the text node.
                 * As long as paddingRight > cursor.width, cursor will be displayed correctly.
                 */
                paddingRight: 1,
            },
            code: {
                ...FontUtils.fontFamily.platform.MONOSPACE,
                fontSize: 13, // TODO: should be 15 if inside h1, see StyleUtils.getCodeFontSize
                color: theme.text,
                backgroundColor: 'transparent',
            },
            pre: {
                ...FontUtils.fontFamily.platform.MONOSPACE,
                fontSize: 13,
                color: theme.text,
                backgroundColor: 'transparent',
            },
            mentionHere: {
                color: theme.ourMentionText,
                backgroundColor: theme.ourMentionBG,
            },
            mentionUser: {
                color: theme.mentionText,
                backgroundColor: theme.mentionBG,
            },
            mentionReport: {
                color: theme.mentionText,
                backgroundColor: theme.mentionBG,
            },
        };

        if (excludeStyles.length) {
            excludeStyles.forEach((key) => {
                const style: Record<string, unknown> = styling[key];
                if (style) {
                    Object.keys(style).forEach((styleKey) => {
                        style[styleKey] = nonStylingDefaultValues[styleKey] ?? style[styleKey];
                    });
                }
            });
        }

        return styling;
    }, [theme, emojiFontSize, excludeStyles, nonStylingDefaultValues]);

    return markdownStyle;
}

export default useMarkdownStyle;
