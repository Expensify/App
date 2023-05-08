import React from 'react';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import htmlRendererPropTypes from './htmlRendererPropTypes';
import Text from '../../Text';
import * as StyleUtils from '../../../styles/StyleUtils';

const HereMentionRenderer = props => (
    <Text>
        <Text

            // passing the true value to the function as here mention is always for the current user
            color={StyleUtils.getUserMentionTextColor(true)}
            style={StyleUtils.getUserMentionStyle(true)}
        >
            <TNodeChildrenRenderer tnode={props.tnode} />
        </Text>
    </Text>
);

HereMentionRenderer.propTypes = htmlRendererPropTypes;
HereMentionRenderer.displayName = 'HereMentionRenderer';

export default HereMentionRenderer;
