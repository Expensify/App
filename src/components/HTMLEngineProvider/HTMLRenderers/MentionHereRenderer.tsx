import React from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import Text from '@components/Text';
import useStyleUtils from '@hooks/useStyleUtils';
import type HtmlRendererProps from './types';

function MentionHereRenderer({style, tnode}: HtmlRendererProps) {
    const StyleUtils = useStyleUtils();

    const styleWithoutColor: StyleProp<TextStyle> =
        typeof style === 'object'
            ? {
                  ...style,
                  color: undefined,
              }
            : {};

    return (
        <Text>
            <Text
                // Passing the true value to the function as here mention is always for the current user
                color={StyleUtils.getMentionTextColor(true)}
                style={[styleWithoutColor, StyleUtils.getMentionStyle(true) as StyleProp<TextStyle>]}
            >
                <TNodeChildrenRenderer tnode={tnode} />
            </Text>
        </Text>
    );
}

MentionHereRenderer.displayName = 'HereMentionRenderer';

export default MentionHereRenderer;
