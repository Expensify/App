import Text from '@components/Text';
import type EmojiWithTooltipProps from './types';

function EmojiWithTooltip({emojiCode, style = {}}: EmojiWithTooltipProps) {
    const regex = /[\uE000-\uF8FF\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}]/u;
    const isCustomEmoji = regex.test(emojiCode);
    console.log("isCustomEmoji ", isCustomEmoji);
    if (isCustomEmoji) {
        // return <Text style={[style, {fontFamily: "CustomEmojiFont"}]}>{emojiCode}</Text>;
        return <Text style={{fontFamily: "CustomEmojiFont"}}>{emojiCode}</Text>;
    }
    return <Text style={style}>{emojiCode}</Text>;
}

EmojiWithTooltip.displayName = 'EmojiWithTooltip';

export default EmojiWithTooltip;
