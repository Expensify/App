import React from 'react';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import Text from '@components/Text';

function RbrRenderer({tnode}: CustomRendererProps<TText | TPhrasing>) {
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
                    >
                        {props.childElement}
                    </Text>
                );
            }}
        />
    );
}

RbrRenderer.displayName = 'RbrRenderer';

export default RbrRenderer;
