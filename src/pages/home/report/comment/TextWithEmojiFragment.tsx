import React from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import {splitTextWithEmojis} from '@libs/EmojiUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';

type ComponentProps = {
    message: string;
    passedStyles: StyleProp<TextStyle>;
    styleAsDeleted?: boolean;
    styleAsMuted?: boolean;
    isSmallScreenWidth?: boolean;
    isEdited?: boolean;
    emojisOnly?: boolean;
};
function TextWithEmojiFragment({message, passedStyles, styleAsDeleted, styleAsMuted, isSmallScreenWidth, isEdited, emojisOnly}: ComponentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const theme = useTheme();
    const processedTextArray = splitTextWithEmojis(message);

    return (
        <Text style={[emojisOnly ? styles.onlyEmojisText : undefined, styles.ltr, passedStyles]}>
            {processedTextArray.map(({text, isEmoji}) =>
                isEmoji ? (
                    <Text style={[emojisOnly ? styles.onlyEmojisText : styles.emojisWithinText]}>{text}</Text>
                ) : (
                    <Text
                        style={[
                            styles.ltr,
                            passedStyles,
                            styleAsDeleted ? styles.offlineFeedback.deleted : undefined,
                            styleAsMuted ? styles.colorMuted : undefined,
                            !DeviceCapabilities.canUseTouchScreen() || !isSmallScreenWidth ? styles.userSelectText : styles.userSelectNone,
                            emojisOnly ? styles.onlyEmojisText : styles.enhancedLineHeight,
                        ]}
                    >
                        {text}
                    </Text>
                ),
            )}

            {isEdited && (
                <>
                    <Text
                        style={[emojisOnly && styles.onlyEmojisTextLineHeight, styles.userSelectNone]}
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
        </Text>
    );
}

TextWithEmojiFragment.displayName = 'TextWithEmojiFragment';

export default TextWithEmojiFragment;
