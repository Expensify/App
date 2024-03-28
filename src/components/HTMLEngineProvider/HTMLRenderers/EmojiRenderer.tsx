import React from 'react';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import EmojiWithTooltip from '@components/EmojiWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';

function EmojiRenderer({tnode}: CustomRendererProps<TText | TPhrasing>) {
    const styles = useThemeStyles();
    const style = 'islarge' in tnode.attributes ? styles.onlyEmojisText : {};
    return (
        <EmojiWithTooltip
            style={[style, styles.cursorDefault]}
            emojiCode={'data' in tnode ? tnode.data : ''}
        />
    );
}

EmojiRenderer.displayName = 'EmojiRenderer';

export default EmojiRenderer;
