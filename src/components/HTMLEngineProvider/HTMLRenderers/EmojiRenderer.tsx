import React, {useMemo} from 'react';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import EmojiWithTooltip from '@components/EmojiWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';

function EmojiRenderer({tnode}: CustomRendererProps<TText | TPhrasing>) {
    const styles = useThemeStyles();
    const style = useMemo(() => {
        if ('islarge' in tnode.attributes) {
            return styles.onlyEmojisText;
        }

        if ('ismedium' in tnode.attributes) {
            // TODO: Think about other approaches to align text selection {lineHeight: 22, marginTop: -2}
            return [styles.emojisWithTextFontSize, styles.verticalAlignMiddle, {lineHeight: 22, marginTop: -2}];
        }

        return null;
    }, [tnode.attributes, styles]);
    return (
        <EmojiWithTooltip
            style={[style, styles.cursorDefault, styles.emojiDefaultStyles]}
            emojiCode={'data' in tnode ? tnode.data : ''}
        />
    );
}

EmojiRenderer.displayName = 'EmojiRenderer';

export default EmojiRenderer;
