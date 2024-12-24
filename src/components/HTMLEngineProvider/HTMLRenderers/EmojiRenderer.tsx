import React, {useMemo} from 'react';
import type {TextStyle} from 'react-native';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import EmojiWithTooltip from '@components/EmojiWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';

function EmojiRenderer({tnode, style: styleProp}: CustomRendererProps<TText | TPhrasing>) {
    const styles = useThemeStyles();
    const style = useMemo(() => {
        if ('islarge' in tnode.attributes) {
            return [styleProp as TextStyle, styles.onlyEmojisText];
        }

        if ('ismedium' in tnode.attributes) {
            return [styleProp as TextStyle, styles.emojisWithTextFontSize, styles.verticalAlignTopText];
        }

        return null;
    }, [tnode.attributes, styles, styleProp]);
    return (
        <EmojiWithTooltip
            style={[style, styles.cursorDefault, styles.emojiDefaultStyles]}
            emojiCode={'data' in tnode ? tnode.data : ''}
        />
    );
}

EmojiRenderer.displayName = 'EmojiRenderer';

export default EmojiRenderer;
