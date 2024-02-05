import React, {useCallback} from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import {View} from 'react-native';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import * as EmojiUtils from '@libs/EmojiUtils';

type EmojiWithTooltipProps = {
    emojiCode: string;
    style?: StyleProp<TextStyle>;
};

function EmojiWithTooltip({emojiCode, style = undefined}: EmojiWithTooltipProps) {
    const styles = useThemeStyles();
    const emoji = EmojiUtils.findEmojiByCode(emojiCode);
    const emojiName = EmojiUtils.getEmojiName(emoji);

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
        [emojiCode, emojiName],
    );

    return (
        <Tooltip renderTooltipContent={emojiTooltipContent}>
            <Text style={style}>{emojiCode}</Text>
        </Tooltip>
    );
}

EmojiWithTooltip.displayName = 'EmojiWithTooltip';

export default EmojiWithTooltip;
