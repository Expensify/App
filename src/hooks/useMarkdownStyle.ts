import type {MarkdownStyle} from '@expensify/react-native-live-markdown';
import {useMemo} from 'react';
import variables from '@styles/variables';
import useTheme from './useTheme';

function useMarkdownStyle(): MarkdownStyle {
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
                fontSize: variables.fontSizeh1,
            },
            quote: {
                borderColor: theme.border,
                borderWidth: 4,
                marginLeft: 0,
                paddingLeft: 6,
            },
            code: {
                color: theme.text,
                backgroundColor: theme.textBackground,
            },
            pre: {
                color: theme.text,
                backgroundColor: theme.textBackground,
            },
            mentionHere: {
                backgroundColor: theme.ourMentionBG,
            },
            mentionUser: {
                backgroundColor: theme.mentionBG,
            },
        }),
        [theme],
    );

    return markdownStyle;
}

export default useMarkdownStyle;
