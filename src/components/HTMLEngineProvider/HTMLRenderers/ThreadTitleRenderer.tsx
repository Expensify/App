import React from 'react';
import {View} from 'react-native';
import {TChildrenRenderer} from 'react-native-render-html';
import type {CustomRendererProps, TBlock, TNode} from 'react-native-render-html';
import Text from '@components/Text';

type ThreadTitleRendererProps = CustomRendererProps<TBlock>;

function ThreadTitleRenderer({tnode}: ThreadTitleRendererProps) {
    const renderFn = (node: TNode) => {
        const children = node.children;

        return children.map((child) => {
            if (child.tagName === 'blockquote') {
                return (
                    <View
                        key={`blockquote-${child.nodeIndex}`}
                        style={[...Object.values(child.styles), {width: '100%'}]}
                    >
                        {renderFn(child)}
                    </View>
                );
            }

            // HTML node
            if (child.tagName) {
                return (
                    <Text numberOfLines={1}>
                        <TChildrenRenderer
                            key={`threadTitleHTML-${child.nodeIndex}`}
                            tchildren={[child]}
                            propsForChildren={{
                                numberOfLines: 1,
                            }}
                        />
                    </Text>
                );
            }

            // TText node
            if ('data' in child) {
                return (
                    <Text
                        key={`threadTitleText-${child.nodeIndex}`}
                        style={[...Object.values(child.styles), {flex: 1, flexWrap: 'wrap'}]}
                        numberOfLines={1}
                    >
                        {child.data}
                    </Text>
                );
            }

            return (
                <View
                    key={`threadTitleBlock-${child.nodeIndex}`}
                    style={[...Object.values(child.styles), {flexDirection: 'row', width: '100%'}]}
                >
                    {renderFn(child)}
                </View>
            );
        });
    };

    return <View style={[...Object.values(tnode.styles), {flexDirection: 'row'}]}>{renderFn(tnode)}</View>;
}

ThreadTitleRenderer.displayName = 'ThreadTitleRenderer';

export default ThreadTitleRenderer;
