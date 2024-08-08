import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {StyleProp, TextStyle} from 'react-native';
import Text from '@components/Text';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import convertToLTR from '@libs/convertToLTR';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as EmojiUtils from '@libs/EmojiUtils';

type TextWithEmojiFragmentProps = {
    /** The message to be displayed */
    message: string;

    /** Additional styles to add after local styles. */
    passedStyles?: StyleProp<TextStyle>;

    /** Should this message fragment be styled as deleted? */
    styleAsDeleted?: boolean;

    /** Should this message fragment be styled as muted? */
    styleAsMuted?: boolean;

    /** Does message contain only emojis? */
    hasEmojisOnly?: boolean;
};

function TextWithEmojiFragment({message, passedStyles, styleAsDeleted, styleAsMuted, hasEmojisOnly}: TextWithEmojiFragmentProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const processedTextArray = useMemo(() => EmojiUtils.splitTextWithEmojis(message), [message]);

    return (
        <Text
            style={[
                hasEmojisOnly ? styles.onlyEmojisText : undefined,
                styles.ltr,
                passedStyles,
                styleAsDeleted ? styles.offlineFeedback.deleted : undefined,
                styleAsMuted ? styles.colorMuted : undefined,
                !DeviceCapabilities.canUseTouchScreen() || !shouldUseNarrowLayout ? styles.userSelectText : styles.userSelectNone,
            ]}
        >
            {processedTextArray.map(({text: textItem, isEmoji}) =>
                isEmoji ? (
                    <View>
                        <Text style={{fontSize: 19, fontFamily: 'System', marginBottom: -5}}>{textItem}</Text>
                    </View>
                ) : (
                    convertToLTR(textItem ?? '')
                ),
            )}

            {/* Option 2 */}
            {/* {processedTextArray.map(({text: textItem, isEmoji}) => (isEmoji ? <Text style={{fontSize: 19, fontFamily: 'System'}}>{textItem}</Text> : convertToLTR(textItem ?? '')))} */}

            {/* Option 3 - with 15 font size */}
            {/* {processedTextArray.map(({text: textItem, isEmoji}) => (isEmoji ? <Text style={{fontFamily: 'System'}}>{textItem}</Text> : convertToLTR(textItem ?? '')))} */}
        </Text>
    );
}

TextWithEmojiFragment.displayName = 'TextWithEmojiFragment';

export default TextWithEmojiFragment;
