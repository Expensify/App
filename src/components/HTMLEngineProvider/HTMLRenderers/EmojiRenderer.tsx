import React from 'react';
import type {CustomRendererProps, TText} from 'react-native-render-html';
import EmojiWithTooltip from '@components/EmojiWithTooltip';

type EmojiRendererProps = CustomRendererProps<TText>;

function EmojiRenderer({tnode}: EmojiRendererProps) {
    return <EmojiWithTooltip emojiCode={tnode.data} />;
}

EmojiRenderer.displayName = 'EmojiRenderer';

export default EmojiRenderer;
