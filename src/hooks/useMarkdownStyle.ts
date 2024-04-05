import type {MarkdownStyle} from '@expensify/react-native-live-markdown';
import {useMemo} from 'react';
import FontUtils from '@styles/utils/FontUtils';
import variables from '@styles/variables';
import useTheme from './useTheme';

function useMarkdownStyle(containsEmojisOnly?: boolean): MarkdownStyle {
    const theme = useTheme();

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
            blockquote: {
                borderColor: theme.border,
                borderWidth: 4,
                marginLeft: 0,
                paddingLeft: 6,
            },
            code: {
                fontFamily: FontUtils.fontFamily.platform.MONOSPACE,
                color: theme.text,
                backgroundColor: 'transparent',
            },
            emoji: {
                fontSize: containsEmojisOnly ? 27 : 19,
            },
            pre: {
                fontFamily: FontUtils.fontFamily.platform.MONOSPACE,
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
        }),
        [theme, containsEmojisOnly],
    );

    return markdownStyle;
}

export default useMarkdownStyle;
