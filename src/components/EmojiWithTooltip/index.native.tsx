import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import {containsCustomEmoji} from '@libs/EmojiUtils';
import type EmojiWithTooltipProps from './types';

function EmojiWithTooltip({emojiCode, style = {}}: EmojiWithTooltipProps) {
    const styles = useThemeStyles();
    return <Text style={[style, containsCustomEmoji(emojiCode) && styles.customEmojiFont]}>{emojiCode}</Text>;
}

EmojiWithTooltip.displayName = 'EmojiWithTooltip';

export default EmojiWithTooltip;
