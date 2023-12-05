import React from 'react';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import _ from 'underscore';
import Text from '@components/Text';
import useThemeStyleUtils from '@styles/useThemeStyleUtils';
import htmlRendererPropTypes from './htmlRendererPropTypes';

function MentionHereRenderer(props) {
    const ThemeStyleUtils = useThemeStyleUtils();
    return (
        <Text>
            <Text
                // Passing the true value to the function as here mention is always for the current user
                color={ThemeStyleUtils.getMentionTextColor(true)}
                style={[_.omit(props.style, 'color'), ThemeStyleUtils.getMentionStyle(true)]}
            >
                <TNodeChildrenRenderer tnode={props.tnode} />
            </Text>
        </Text>
    );
}

MentionHereRenderer.propTypes = htmlRendererPropTypes;
MentionHereRenderer.displayName = 'HereMentionRenderer';

export default MentionHereRenderer;
