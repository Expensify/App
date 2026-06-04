import React from 'react';
import type {ValueOf} from 'type-fest';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {containsCustomEmoji as containsCustomEmojiUtils, containsOnlyCustomEmoji} from '@libs/EmojiUtils';
import FS from '@libs/Fullstory';
import type {OptionData} from '@libs/ReportUtils';
import TextWithEmojiFragment from '@pages/inbox/report/comment/TextWithEmojiFragment';
import CONST from '@src/CONST';

type OptionMode = ValueOf<typeof CONST.OPTION_MODE>;

type SubtitleProps = {
    /** Option data for the row. Source of `alternateText` and emoji rendering hints. */
    optionItem: OptionData;

    /** Display density mode. Compact rows render the subtitle with compact styles; the subtitle is hidden only when `optionItem.alternateText` is empty. */
    viewMode: OptionMode;

    /** Whether the row is the currently focused/active option. Drives the active text style. */
    isOptionFocused: boolean;
};

function Subtitle({optionItem, viewMode, isOptionFocused}: SubtitleProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const alternateText = optionItem.alternateText;
    if (!alternateText) {
        return null;
    }

    const isInFocusMode = viewMode === CONST.OPTION_MODE.COMPACT;
    const textStyle = isOptionFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText;
    const alternateTextStyle = isInFocusMode
        ? [textStyle, styles.textLabelSupporting, styles.optionAlternateTextCompact, styles.pre, styles.ml2]
        : [textStyle, styles.optionAlternateText, styles.textLabelSupporting, styles.pre];
    const alternateTextFSClass = FS.getChatFSClass(optionItem);

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

Subtitle.displayName = 'OptionRow.Subtitle';

export default Subtitle;
