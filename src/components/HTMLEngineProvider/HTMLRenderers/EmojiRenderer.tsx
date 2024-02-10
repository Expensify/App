import React from 'react';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import EmojiWithTooltip from '@components/EmojiWithTooltip';

function EmojiRenderer({tnode}: CustomRendererProps<TText | TPhrasing>) {
    return <EmojiWithTooltip emojiCode={'data' in tnode ? tnode.data : ''} />;
}

EmojiRenderer.displayName = 'EmojiRenderer';

export default EmojiRenderer;
