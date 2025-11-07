import React from 'react';
import Text from '@components/Text';
import useIsInFocusMode from '@hooks/useIsInFocusMode';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {containsCustomEmoji, containsOnlyCustomEmoji} from '@libs/EmojiUtils';
import TextWithEmojiFragment from '@pages/home/report/comment/TextWithEmojiFragment';
import CONST from '@src/CONST';

function OptionRowAlternateText({isFocused, text}: {isFocused: boolean; text: string}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const isInFocusMode = useIsInFocusMode();
    const textStyle = isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText;
    const alternateTextStyle = isInFocusMode
        ? [textStyle, styles.textLabelSupporting, styles.optionAlternateTextCompact, styles.ml2]
        : [textStyle, styles.optionAlternateText, styles.textLabelSupporting];
    const alternateTextContainsCustomEmojiWithText = containsCustomEmoji(text) && !containsOnlyCustomEmoji(text);

    return (
        <Text
            style={alternateTextStyle}
            numberOfLines={1}
            accessibilityLabel={translate('accessibilityHints.lastChatMessagePreview')}
            fsClass={CONST.FULLSTORY.CLASS.MASK}
        >
            {alternateTextContainsCustomEmojiWithText ? (
                <TextWithEmojiFragment
                    message={text}
                    style={[alternateTextStyle, styles.mh0]}
                    alignCustomEmoji
                />
            ) : (
                text
            )}
        </Text>
    );
}

export default OptionRowAlternateText;
