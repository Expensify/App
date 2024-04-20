import React from 'react';
import type {TDefaultRendererProps} from 'react-native-render-html';
import Text from '@components/Text';
import type {ThemeStyles} from '@styles/index';
import type {TTextOrTPhrasing} from './types';

function renderEmojisAsTextComponents(defaultRendererProps: TDefaultRendererProps<TTextOrTPhrasing>, styles: ThemeStyles) {
    const elements: Array<string | React.JSX.Element> = [];
    let hasLargeStyle = false;

    if ('data' in defaultRendererProps.tnode) {
        elements.push(defaultRendererProps.tnode.data);
        return {elements, hasLargeStyle};
    }

    if (!defaultRendererProps.tnode.children) {
        return {elements, hasLargeStyle};
    }

    defaultRendererProps.tnode.children.forEach((child) => {
        if (!('data' in child)) {
            return;
        }

        if (child.tagName === 'emoji') {
            const largeStyle = 'islarge' in child.attributes ? styles.onlyEmojisText : {};
            if (Object.keys(largeStyle).length > 0) {
                hasLargeStyle = true;
            }
            elements.push(
                <Text
                    style={[largeStyle, styles.emojiDefault]}
                    key={child.data}
                >
                    {child.data}
                </Text>,
            );
        } else {
            elements.push(child.data);
        }
    });

    return {elements, hasLargeStyle};
}

export default renderEmojisAsTextComponents;
