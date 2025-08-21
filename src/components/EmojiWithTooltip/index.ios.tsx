import {StyleSheet, View} from 'react-native';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import type EmojiWithTooltipProps from './types';

function EmojiWithTooltip({emojiCode, style = {}, isMedium = false}: EmojiWithTooltipProps) {
    const styles = useThemeStyles();

    // Extract only text decoration styles (strikethrough, underline, etc.) to preserve emoji sizing.
    // On iOS, emojis are larger and need the View wrapper to prevent clipping, but we still want
    // text decorations like strikethrough to be applied. We can't apply the full parent style
    // because it would override the carefully tuned emojisWithTextFontSizeAligned styles and
    // cause the emoji to be cut off again.
    const flattenedStyle = StyleSheet.flatten(style);
    const textDecorationStyles = {
        textDecorationLine: flattenedStyle?.textDecorationLine,
        textDecorationStyle: flattenedStyle?.textDecorationStyle,
        textDecorationColor: flattenedStyle?.textDecorationColor,
    };

    return isMedium ? (
        <Text style={style}>
            <View>
                <Text style={[styles.emojisWithTextFontSizeAligned, textDecorationStyles]}>{emojiCode}</Text>
            </View>
        </Text>
    ) : (
        <Text style={style}>{emojiCode}</Text>
    );
}

EmojiWithTooltip.displayName = 'EmojiWithTooltip';

export default EmojiWithTooltip;
