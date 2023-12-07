import React from 'react';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import _ from 'underscore';
import Text from '@components/Text';
<<<<<<< HEAD
import * as StyleUtils from '@styles/StyleUtils';
import useTheme from '@styles/theme/useTheme';
||||||| b0268fab88
import * as StyleUtils from '@styles/StyleUtils';
import useTheme from '@styles/theme/useTheme';
=======
import useStyleUtils from '@styles/useStyleUtils';
>>>>>>> @chrispader/use-style-utils-hook
import htmlRendererPropTypes from './htmlRendererPropTypes';

function MentionHereRenderer(props) {
    const StyleUtils = useStyleUtils();
    return (
        <Text>
            <Text
                // Passing the true value to the function as here mention is always for the current user
                color={StyleUtils.getMentionTextColor(true)}
                style={[_.omit(props.style, 'color'), StyleUtils.getMentionStyle(true)]}
            >
                <TNodeChildrenRenderer tnode={props.tnode} />
            </Text>
        </Text>
    );
}

MentionHereRenderer.propTypes = htmlRendererPropTypes;
MentionHereRenderer.displayName = 'HereMentionRenderer';

export default MentionHereRenderer;
