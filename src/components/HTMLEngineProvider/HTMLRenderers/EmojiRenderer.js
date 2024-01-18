import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import Text from '@components/Text';
import htmlRendererPropTypes from './htmlRendererPropTypes';
import Tooltip from '@components/Tooltip';
import * as EmojiUtils from '@libs/EmojiUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import EmojiWithTooltip from '@components/EmojiWithTooltip';

function EmojiRenderer(props) {
    return (
        <EmojiWithTooltip 
            emojiCode={props.tnode.data}
        />
    )
}

EmojiRenderer.propTypes = htmlRendererPropTypes;
EmojiRenderer.displayName = 'HereMentionRenderer';

export default EmojiRenderer;
