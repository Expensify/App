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
            return [styles.emojisWithinText, styles.verticalAlignMiddle];
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
