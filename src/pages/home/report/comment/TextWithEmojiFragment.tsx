import React from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import {View} from 'react-native';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import {splitTextWithEmojis} from '@libs/EmojiUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';

type ComponentProps = {
    text: string;
    textContainsOnlyEmojis: boolean;
    passedStyles: StyleProp<TextStyle>;
    styleAsDeleted?: boolean;
    styleAsMuted?: boolean;
    isSmallScreenWidth?: boolean;
    isEdited?: boolean;
};
function TextWithEmojiFragment({text, textContainsOnlyEmojis, passedStyles, styleAsDeleted, styleAsMuted, isSmallScreenWidth, isEdited}: ComponentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const theme = useTheme();
    const processedTextArray = splitTextWithEmojis(text);

    return (
        <View style={styles.emojisAndTextWrapper}>
            {processedTextArray.map((word: string) =>
                CONST.REGEX.EMOJIS.test(word) ? (
                    <Text style={[styles.emojisWithinText, textContainsOnlyEmojis ? styles.onlyEmojisText : undefined]}>{word}</Text>
                ) : (
                    <Text
                        style={[
                            styles.ltr,
                            passedStyles,
                            styleAsDeleted ? styles.offlineFeedback.deleted : undefined,
                            styleAsMuted ? styles.colorMuted : undefined,
                            !DeviceCapabilities.canUseTouchScreen() || !isSmallScreenWidth ? styles.userSelectText : styles.userSelectNone,
                        ]}
                    >
                        {word}
                    </Text>
                ),
            )}

            {isEdited && (
                <>
                    <Text
                        style={[textContainsOnlyEmojis && styles.onlyEmojisTextLineHeight, styles.userSelectNone]}
                        dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                    >
                        {' '}
                    </Text>
                    <Text
                        fontSize={variables.fontSizeSmall}
                        color={theme.textSupporting}
                        style={[styles.editedLabelStyles, styleAsDeleted && styles.offlineFeedback.deleted, passedStyles]}
                    >
                        {translate('reportActionCompose.edited')}
                    </Text>
                </>
            )}
        </View>
    );
}

TextWithEmojiFragment.displayName = 'TextWithEmojiFragment';

export default TextWithEmojiFragment;
