import React from 'react';
import {StyleSheet} from 'react-native';
import type {TextStyle} from 'react-native';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';

function RBRRenderer({tnode, style}: CustomRendererProps<TText | TPhrasing>) {
    const styles = useThemeStyles();
    const htmlAttribs = tnode.attributes;
    const isSmall = htmlAttribs?.issmall !== undefined;
    const shouldShowEllipsis = htmlAttribs?.shouldshowellipsis !== undefined;
    const flattenStyle = StyleSheet.flatten(style as TextStyle);

    return (
        <TNodeChildrenRenderer
            tnode={tnode}
            renderChild={(props) => {
                return (
                    <Text
                        numberOfLines={shouldShowEllipsis ? 1 : 0}
                        ellipsizeMode="tail"
                        key={props.key}
                        style={[styles.textLabelError, flattenStyle, isSmall ? styles.textMicro : {}]}
                    >
                        {props.childElement}
                    </Text>
                );
            }}
        />
    );
}

export default RBRRenderer;
