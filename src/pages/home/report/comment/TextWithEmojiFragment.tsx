import React, {useMemo} from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as EmojiUtils from '@libs/EmojiUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';

type TextWithEmojiFragmentProps = {
    /** The message to be displayed */
    message: string;

    /** Additional styles to add after local styles. */
    passedStyles?: StyleProp<TextStyle>;

    /** Should this message fragment be styled as deleted? */
    styleAsDeleted?: boolean;

    /** Should this message fragment be styled as muted? */
    styleAsMuted?: boolean;

    /** Should "(edited)" suffix be rendered? */
    isEdited?: boolean;

    /** Does message contain only emojis? */
    hasEmojisOnly?: boolean;
};

function TextWithEmojiFragment({message, passedStyles, styleAsDeleted, styleAsMuted, isEdited, hasEmojisOnly}: TextWithEmojiFragmentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const theme = useTheme();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const processedTextArray = useMemo(() => EmojiUtils.splitTextWithEmojis(message), [message]);

    return (
        <Text style={[hasEmojisOnly ? styles.onlyEmojisText : undefined, styles.ltr, passedStyles]}>
            {processedTextArray.map(({text, isEmoji}) =>
                isEmoji ? (
                    <Text style={[hasEmojisOnly ? styles.onlyEmojisText : styles.emojisWithinText]}>{text}</Text>
                ) : (
                    <Text
                        style={[
                            styles.ltr,
                            passedStyles,
                            styleAsDeleted ? styles.offlineFeedback.deleted : undefined,
                            styleAsMuted ? styles.colorMuted : undefined,
                            !DeviceCapabilities.canUseTouchScreen() || !shouldUseNarrowLayout ? styles.userSelectText : styles.userSelectNone,
                            hasEmojisOnly ? styles.onlyEmojisText : styles.enhancedLineHeight,
                        ]}
                    >
                        {text}
                    </Text>
                ),
            )}

            {isEdited && (
                <>
                    <Text
                        style={[hasEmojisOnly && styles.onlyEmojisTextLineHeight, styles.userSelectNone]}
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
