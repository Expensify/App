import {View} from 'react-native';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import type EmojiWithTooltipProps from './types';

function EmojiWithTooltip({emojiCode, style = {}, isMedium = false}: EmojiWithTooltipProps) {
    const styles = useThemeStyles();

    return isMedium ? (
        <Text style={style}>
            <View>
                <Text style={styles.emojisWithTextFontSizeAligned}>{emojiCode}</Text>
            </View>
        </Text>
    ) : (
        <Text style={style}>{emojiCode}</Text>
    );
}

EmojiWithTooltip.displayName = 'EmojiWithTooltip';

export default EmojiWithTooltip;
