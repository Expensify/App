import {useMemo} from 'react';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import {containsCustomEmoji} from '@libs/EmojiUtils';
import type EmojiWithTooltipProps from './types';

function EmojiWithTooltip({emojiCode, style = {}}: EmojiWithTooltipProps) {
    const isCustomEmoji = useMemo(() => containsCustomEmoji(emojiCode), [emojiCode]);
    const styles = useThemeStyles();
    return <Text style={[style, isCustomEmoji && styles.customEmojiFont]}>{emojiCode}</Text>;
}

export default EmojiWithTooltip;
