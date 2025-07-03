import Text from '@components/Text';
import type EmojiWithTooltipProps from './types';

function EmojiWithTooltip({emojiCode, style = {}}: EmojiWithTooltipProps) {
    return <Text style={style}>{emojiCode}</Text>;
}

EmojiWithTooltip.displayName = 'EmojiWithTooltip';

export default EmojiWithTooltip;
