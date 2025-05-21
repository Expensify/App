import React from 'react';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';

function RBRRenderer({tnode}: CustomRendererProps<TText | TPhrasing>) {
    const styles = useThemeStyles();
    const htmlAttribs = tnode.attributes;
    const shouldShowEllipsis = htmlAttribs?.shouldshowellipsis !== undefined;

    return (
        <TNodeChildrenRenderer
            tnode={tnode}
            renderChild={(props) => {
                return (
                    <Text
                        numberOfLines={shouldShowEllipsis ? 1 : 0}
                        ellipsizeMode="tail"
                        key={props.key}
                        style={[styles.textLabelError]}
                    >
                        {props.childElement}
                    </Text>
                );
            }}
        />
    );
}

RBRRenderer.displayName = 'RBRRenderer';

export default RBRRenderer;
