import type {MarkdownStyle} from '@expensify/react-native-live-markdown';
import {useMemo} from 'react';
import FontUtils from '@styles/utils/FontUtils';
import variables from '@styles/variables';
import useTheme from './useTheme';

const defaultEmptyArray: Array<keyof MarkdownStyle> = [];

function useMarkdownStyle(hasMessageOnlyEmojis: boolean, excludeStyles: Array<keyof MarkdownStyle> = defaultEmptyArray): MarkdownStyle {
    const theme = useTheme();
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
                ...FontUtils.fontFamily.platform.CUSTOM_EMOJI_FONT,
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
                fontFamily: FontUtils.fontFamily.platform.MONOSPACE.fontFamily,
                fontSize: 13, // TODO: should be 15 if inside h1, see StyleUtils.getCodeFontSize
                color: theme.text,
                paddingHorizontal: 5,
                borderColor: theme.border,
                backgroundColor: theme.textBackground,
                h1NestedFontSize: 15,
            },
            pre: {
                ...FontUtils.fontFamily.platform.MONOSPACE,
                fontSize: 13,
                color: theme.text,
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderColor: theme.border,
                backgroundColor: theme.textBackground,
            },
            mentionHere: {
                color: theme.ourMentionText,
                backgroundColor: theme.ourMentionBG,
                borderRadius: variables.componentBorderRadiusSmall,
            },
            mentionUser: {
                color: theme.mentionText,
                backgroundColor: theme.mentionBG,
                borderRadius: variables.componentBorderRadiusSmall,
            },
            mentionReport: {
                color: theme.mentionText,
                backgroundColor: theme.mentionBG,
            },
            inlineImage: {
                minWidth: variables.inlineImagePreviewMinSize,
                minHeight: variables.inlineImagePreviewMinSize,
                maxWidth: variables.inlineImagePreviewMaxSize,
                maxHeight: variables.inlineImagePreviewMaxSize,
                borderRadius: variables.componentBorderRadius,
                marginTop: 4,
            },
            loadingIndicator: {
                primaryColor: theme.spinner,
                secondaryColor: `${theme.spinner}33`,
            },
            loadingIndicatorContainer: {},
        };

        if (excludeStyles.length) {
            for (const key of excludeStyles) {
                const style: Record<string, unknown> = styling[key];
                if (style) {
                    for (const styleKey of Object.keys(style)) {
                        style[styleKey] = nonStylingDefaultValues[styleKey] ?? style[styleKey];
                    }
                }
            }
        }

        return styling;
    }, [theme, emojiFontSize, excludeStyles, nonStylingDefaultValues]);

    return markdownStyle;
}

export default useMarkdownStyle;
