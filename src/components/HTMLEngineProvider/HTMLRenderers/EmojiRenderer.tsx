import type {CustomRendererProps, TPhrasing, TText} from '@native-html/render';
import React from 'react';
import type {TextStyle} from 'react-native';
import EmojiWithTooltip from '@components/EmojiWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';

function EmojiRenderer({tnode, style: styleProp}: CustomRendererProps<TText | TPhrasing>) {
    const styles = useThemeStyles();

    let style;
    if ('islarge' in tnode.attributes) {
        style = [styleProp as TextStyle, styles.onlyEmojisText];
    } else if ('ismedium' in tnode.attributes) {
        style = [styleProp as TextStyle, styles.emojisWithTextFontSize, styles.verticalAlignTopText];
    } else {
        style = null;
    }

    return (
        <EmojiWithTooltip
            isOnSeparateLine={'oneline' in tnode.attributes}
            style={[style, styles.cursorDefault, styles.emojiDefaultStyles]}
            emojiCode={'data' in tnode ? tnode.data : ''}
            isMedium={'ismedium' in tnode.attributes}
        />
    );
}

export default EmojiRenderer;
