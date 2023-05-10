import React from 'react';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import htmlRendererPropTypes from './htmlRendererPropTypes';
import Text from '../../Text';
import * as StyleUtils from '../../../styles/StyleUtils';

const MentionHereRenderer = (props) => (
    <Text>
        <Text
            // Passing the true value to the function as here mention is always for the current user
            color={StyleUtils.getMentionTextColor(true)}
            style={StyleUtils.getMentionStyle(true)}
        >
            <TNodeChildrenRenderer tnode={props.tnode} />
        </Text>
    </Text>
);

MentionHereRenderer.propTypes = htmlRendererPropTypes;
MentionHereRenderer.displayName = 'HereMentionRenderer';

export default MentionHereRenderer;
