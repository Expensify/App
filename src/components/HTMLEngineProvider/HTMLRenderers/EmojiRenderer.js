import React from 'react';
import EmojiWithTooltip from '@components/EmojiWithTooltip';
import htmlRendererPropTypes from './htmlRendererPropTypes';

function EmojiRenderer(props) {
    return <EmojiWithTooltip emojiCode={props.tnode.data} />;
}

EmojiRenderer.propTypes = htmlRendererPropTypes;
EmojiRenderer.displayName = 'EmojiRenderer';

export default EmojiRenderer;
