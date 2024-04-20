import React from 'react';
import type {TDefaultRendererProps} from 'react-native-render-html';
import EmojiWithTooltip from '@components/EmojiWithTooltip';
import type {ThemeStyles} from '@styles/index';
import type {TTextOrTPhrasing} from './types';

function renderEmojis(defaultRendererProps: TDefaultRendererProps<TTextOrTPhrasing>, styles: ThemeStyles) {
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
                <EmojiWithTooltip
                    style={[styles.cursorDefault, largeStyle, styles.emojiDefault]}
                    key={child.data}
                    emojiCode={child.data}
                />,
            );
        } else {
            elements.push(child.data);
        }
    });

    return {elements, hasLargeStyle};
}

export default renderEmojis;
