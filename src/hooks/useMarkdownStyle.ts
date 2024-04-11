import type {MarkdownStyle} from '@expensify/react-native-live-markdown';
import {useEffect, useMemo, useState} from 'react';
import {containsOnlyEmojis} from '@libs/EmojiUtils';
import FontUtils from '@styles/utils/FontUtils';
import variables from '@styles/variables';
import useTheme from './useTheme';

type UseMarkdownStyleProp = {
    message?: string | null;
};

function useMarkdownStyle({message = null}: UseMarkdownStyleProp = {}): MarkdownStyle {
    const theme = useTheme();
    const [emojiSize, setEmojiSize] = useState<number>(variables.emojiSize);

    useEffect(() => {
        if (message === null && message !== '') {
            return;
        }
        if (containsOnlyEmojis(message)) {
            setEmojiSize(variables.fontSizeOnlyEmojis);
        } else {
            setEmojiSize(variables.emojiSize);
        }
    }, [message]);

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
                fontSize: emojiSize,
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
        }),
        [theme, emojiSize],
    );

    return markdownStyle;
}

export default useMarkdownStyle;
