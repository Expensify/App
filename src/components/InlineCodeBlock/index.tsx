import React from 'react';
import { StyleSheet } from 'react-native';
import Text from '@components/Text';
import type InlineCodeBlockProps from './types';
import type { TTextOrTPhrasing } from './types';
import useThemeStyles from '@hooks/useThemeStyles';
import { TDefaultRendererProps } from 'react-native-render-html';
import { ThemeStyles } from '@styles/index';

function renderEmojisAsTextComponents(defaultRendererProps: TDefaultRendererProps<TTextOrTPhrasing>, styles: ThemeStyles) {
    const elements: (string | React.JSX.Element)[] = [];
    
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

function InlineCodeBlock<TComponent extends TTextOrTPhrasing>({ TDefaultRenderer, textStyle, defaultRendererProps, boxModelStyle }: InlineCodeBlockProps<TComponent>) {
    const styles = useThemeStyles();
    const flattenTextStyle = StyleSheet.flatten(textStyle);
    const { textDecorationLine, ...textStyles } = flattenTextStyle;
    const { elements, hasLargeStyle } = renderEmojisAsTextComponents(defaultRendererProps, styles);

    return (
        <TDefaultRenderer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...defaultRendererProps}
        >
            <Text style={[boxModelStyle, textStyles, hasLargeStyle ? styles.onlyEmojisText : {}]}>
                {elements}
            </Text>
        </TDefaultRenderer>
    );
}
InlineCodeBlock.displayName = 'InlineCodeBlock';

export default InlineCodeBlock;