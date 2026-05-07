import React from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import type {ValueOf} from 'type-fest';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {containsCustomEmoji as containsCustomEmojiUtils, containsOnlyCustomEmoji} from '@libs/EmojiUtils';
import FS from '@libs/Fullstory';
import TextWithEmojiFragment from '@pages/inbox/report/comment/TextWithEmojiFragment';
import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';

type OptionMode = ValueOf<typeof CONST.OPTION_MODE>;

type OptionRowAlternateTextProps = {
    alternateText: string | undefined;
    report?: Report;
    viewMode: OptionMode;
    isOptionFocused: boolean;
    style?: StyleProp<TextStyle>;
};

function OptionRowAlternateText({alternateText, report, viewMode, isOptionFocused, style}: OptionRowAlternateTextProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    if (!alternateText) {
        return null;
    }

    const isInFocusMode = viewMode === CONST.OPTION_MODE.COMPACT;
    const textStyle = isOptionFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText;
    const alternateTextStyle = isInFocusMode
        ? [textStyle, styles.textLabelSupporting, styles.optionAlternateTextCompact, styles.ml2, style]
        : [textStyle, styles.optionAlternateText, styles.textLabelSupporting, style];
    const alternateTextFSClass = FS.getChatFSClass(report);

    const containsCustomEmojiWithText = containsCustomEmojiUtils(alternateText) && !containsOnlyCustomEmoji(alternateText);

    return (
        <Text
            style={alternateTextStyle}
            numberOfLines={1}
            accessibilityLabel={translate('accessibilityHints.lastChatMessagePreview')}
            fsClass={alternateTextFSClass}
        >
            {containsCustomEmojiWithText ? (
                <TextWithEmojiFragment
                    message={alternateText}
                    style={[alternateTextStyle, styles.mh0]}
                    alignCustomEmoji
                />
            ) : (
                alternateText
            )}
        </Text>
    );
}

OptionRowAlternateText.displayName = 'OptionRowAlternateText';

export default OptionRowAlternateText;
