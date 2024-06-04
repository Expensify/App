import type {MarkdownStyle} from '@expensify/react-native-live-markdown';
import {useMemo} from 'react';
import {containsOnlyEmojis} from '@libs/EmojiUtils';
import FontUtils from '@styles/utils/FontUtils';
import variables from '@styles/variables';
import useTheme from './useTheme';

function useMarkdownStyle(message: string | null = null): MarkdownStyle {
    const theme = useTheme();
    const emojiFontSize = containsOnlyEmojis(message ?? '') ? variables.fontSizeOnlyEmojis : variables.fontSizeNormal;

    const markdownStyle = useMemo(
        () => ({
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
            },
            blockquote: {
                borderColor: theme.border,
                borderWidth: 4,
                marginLeft: 0,
                paddingLeft: 6,
            },
            code: {
                fontFamily: FontUtils.fontFamily.platform.MONOSPACE,
                fontSize: 13, // TODO: should be 15 if inside h1, see StyleUtils.getCodeFontSize
                color: theme.text,
                backgroundColor: 'transparent',
            },
            pre: {
                fontFamily: FontUtils.fontFamily.platform.MONOSPACE,
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
        }),
        [theme, emojiFontSize],
    );

    return markdownStyle;
}

export default useMarkdownStyle;
