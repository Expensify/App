import React from 'react';
import type {TextStyle} from 'react-native';
import {StyleSheet} from 'react-native';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import Text from '@components/Text';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';

function CommandRenderer({style}: CustomRendererProps<TText | TPhrasing>) {
    const StyleUtils = useStyleUtils();
    const theme = useTheme();

    const flattenStyle = StyleSheet.flatten(style as TextStyle);
    const {color, ...styleWithoutColor} = flattenStyle;

    return (
        <Text>
            <Text
                color={theme.ourMentionText}
                style={[styleWithoutColor, StyleUtils.getMentionStyle(true)]}
            >
                /summarize
            </Text>
        </Text>
    );
}

CommandRenderer.displayName = 'CommandRenderer';

export default CommandRenderer;
