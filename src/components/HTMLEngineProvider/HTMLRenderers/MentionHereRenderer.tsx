import Text from '@components/Text';

import useStyleUtils from '@hooks/useStyleUtils';

import type {TextStyle} from 'react-native';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';

import React from 'react';
import {StyleSheet} from 'react-native';
import {TNodeChildrenRenderer} from 'react-native-render-html';

function MentionHereRenderer({style, tnode}: CustomRendererProps<TText | TPhrasing>) {
    const StyleUtils = useStyleUtils();

    // `StyleSheet.flatten` returns nothing for an empty style
    const flattenStyle: TextStyle = StyleSheet.flatten(style as TextStyle) ?? {};
    const {color, ...styleWithoutColor} = flattenStyle;

    return (
        <Text>
            <Text
                // Passing the true value to the function as here mention is always for the current user
                color={StyleUtils.getMentionTextColor(true)}
                style={[styleWithoutColor, StyleUtils.getMentionStyle(true)]}
            >
                <TNodeChildrenRenderer tnode={tnode} />
            </Text>
        </Text>
    );
}

export default MentionHereRenderer;
