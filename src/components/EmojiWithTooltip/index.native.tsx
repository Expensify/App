import Text from '@components/Text';
import type EmojiWithTooltipProps from './types';
import * as EmojiUtils from '@libs/EmojiUtils';
import useThemeStyles from '@hooks/useThemeStyles';

function EmojiWithTooltip({emojiCode, style = {}}: EmojiWithTooltipProps) {
    const styles = useThemeStyles();
    return <Text style={[style, EmojiUtils.containsCustomEmoji(emojiCode) && styles.customEmojiFont]}>{emojiCode}</Text>;
}

EmojiWithTooltip.displayName = 'EmojiWithTooltip';

export default EmojiWithTooltip;
