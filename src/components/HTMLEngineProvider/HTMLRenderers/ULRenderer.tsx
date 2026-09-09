import useThemeStyles from '@hooks/useThemeStyles';

import type {CustomRendererProps, TBlock} from 'react-native-render-html';

import React from 'react';
import {View} from 'react-native';
import {TNodeRenderer} from 'react-native-render-html';

import BulletItemRenderer from './BulletItemRenderer';

/**
 * Bypasses the library's internal ULRenderer (which wraps children in MarkedListItem)
 * and renders <ul> as a plain block container that draws bullet markers around each
 * direct <li> child — matching how <bullet-list>/<bullet-item> render.
 */
function ULRenderer({tnode, style}: CustomRendererProps<TBlock>) {
    const styles = useThemeStyles();
    return (
        <View style={[style, styles.gap2]}>
            {tnode.children.map((child, index) => {
                const key = `${child.tagName ?? 'node'}-${index}`;
                if (child.tagName === 'li') {
                    return (
                        <BulletItemRenderer
                            key={key}
                            tnode={child}
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

export default ULRenderer;
