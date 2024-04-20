import React from 'react';
import Text from '@components/Text';
import type { TTextOrTPhrasing } from './types';
import { TDefaultRendererProps } from 'react-native-render-html';
import useThemeStyles from '@hooks/useThemeStyles';


export function renderEmojisAsTextComponents(defaultRendererProps: TDefaultRendererProps<TTextOrTPhrasing>) {
    const elements: (string | React.JSX.Element)[] = [];
    const styles = useThemeStyles();

    let hasLargeStyle = false;
    if ('data' in defaultRendererProps.tnode) {
        elements.push(defaultRendererProps.tnode.data);
    } else if (defaultRendererProps.tnode.children) {
        defaultRendererProps.tnode.children.forEach((child) => {
            if ('data' in child) {
                if (child.tagName === 'emoji') {
                    const largeStyle = 'islarge' in child.attributes ? styles.onlyEmojisText : {};
                    if (Object.keys(largeStyle).length > 0) {
                        hasLargeStyle = true;
                    }
                    elements.push(<Text style={[largeStyle, styles.emojiDefault]} key={child.data}>{child.data}</Text>);
                } else {
                    elements.push(child.data);
                }
            }
        });
    }

    return { elements, hasLargeStyle };
}
