import React from 'react';
import {View} from 'react-native';
import type {CustomRendererProps, TBlock} from 'react-native-render-html';
import {TNodeRenderer} from 'react-native-render-html';
import useThemeStyles from '@hooks/useThemeStyles';
import NumberedItemRenderer from './NumberedItemRenderer';

function buildLiIndices(children: CustomRendererProps<TBlock>['tnode']['children']): Map<number, number> {
    const map = new Map<number, number>();
    let counter = 0;
    for (const [i, child] of children.entries()) {
        if (child.tagName === 'li') {
            counter += 1;
            map.set(i, counter);
        }
    }
    return map;
}

function OLRenderer({tnode, style}: CustomRendererProps<TBlock>) {
    const styles = useThemeStyles();
    const liIndices = buildLiIndices(tnode.children);

    return (
        <View style={[style, styles.gap2]}>
            {tnode.children.map((child, index) => {
                const key = `${child.tagName ?? 'node'}-${index}`;
                const liIndex = liIndices.get(index);
                if (liIndex !== undefined) {
                    return (
                        <NumberedItemRenderer
                            key={key}
                            tnode={child}
                            index={liIndex}
                        />
                    );
                }
                return (
                    <TNodeRenderer
                        key={key}
                        tnode={child}
                        renderIndex={index}
                        renderLength={tnode.children.length}
                    />
                );
            })}
        </View>
    );
}

export default OLRenderer;
