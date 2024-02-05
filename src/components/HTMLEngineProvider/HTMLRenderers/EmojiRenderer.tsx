import React from 'react';
import EmojiWithTooltip from '@components/EmojiWithTooltip';

type EmojiRendererProps = {
    tnode: {
        data: string;
    };
};

function EmojiRenderer({tnode}: EmojiRendererProps) {
    return <EmojiWithTooltip emojiCode={tnode.data} />;
}

EmojiRenderer.displayName = 'EmojiRenderer';

export default EmojiRenderer;
