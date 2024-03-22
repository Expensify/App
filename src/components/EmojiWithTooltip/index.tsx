import React, {useCallback} from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as EmojiUtils from '@libs/EmojiUtils';
import type EmojiWithTooltipProps from './types';

function EmojiWithTooltip({emojiCode, style = {}}: EmojiWithTooltipProps) {
    const {preferredLocale} = useLocalize();
    const styles = useThemeStyles();
    const emoji = EmojiUtils.findEmojiByCode(emojiCode);
    const emojiName = EmojiUtils.getEmojiName(emoji, preferredLocale);

    const emojiTooltipContent = useCallback(
        () => (
            <View style={[styles.alignItemsCenter, styles.ph2]}>
                <View style={[styles.flexRow, styles.emojiTooltipWrapper]}>
                    <Text
                        key={emojiCode}
                        style={styles.onlyEmojisText}
                    >
                        {emojiCode}
                    </Text>
                </View>
                <Text style={[styles.textMicro, styles.fontColorReactionLabel]}>{`:${emojiName}:`}</Text>
            </View>
        ),
        [emojiCode, emojiName, styles.alignItemsCenter, styles.ph2, styles.flexRow, styles.emojiTooltipWrapper, styles.fontColorReactionLabel, styles.onlyEmojisText, styles.textMicro],
    );

    return (
        <Tooltip renderTooltipContent={emojiTooltipContent}>
            <Text style={[style, styles.cursorDefault]}>{emojiCode}</Text>
        </Tooltip>
    );
}

EmojiWithTooltip.displayName = 'EmojiWithTooltip';

export default EmojiWithTooltip;
