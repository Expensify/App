import {View} from 'react-native';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import type EmojiWithTooltipProps from './types';

function EmojiWithTooltip({emojiCode, style = {}, isMedium = false, isOnSeparateLine = false}: EmojiWithTooltipProps) {
    const styles = useThemeStyles();
    const isCustomEmoji = emojiCode === '\uE100';
    if (isOnSeparateLine) {
        return <Text style={[style, styles.emojisWithTextFontSizeAligned]}>{emojiCode}</Text>;
    }

    return isMedium ? (
        <Text style={style}>
            <View>
                <Text style={[styles.emojisWithTextFontSizeAligned, isCustomEmoji && styles.customEmojiFontAlignment]}>{emojiCode}</Text>
            </View>
        </Text>
    ) : (
        <Text style={[style, isCustomEmoji && styles.customEmojiFontAlignment]}>{emojiCode}</Text>
    );
}

export default EmojiWithTooltip;
