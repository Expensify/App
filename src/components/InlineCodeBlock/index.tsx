import React from 'react';
import {StyleSheet} from 'react-native';
import type {StyleProp, TextStyle} from 'react-native';
import type {TDefaultRendererProps} from 'react-native-render-html';
import EmojiWithTooltip from '@components/EmojiWithTooltip';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import type {ThemeStyles} from '@styles/index';
import type {TTextOrTPhrasing} from './types';
import type InlineCodeBlockProps from './types';

/**
 * This function is used to render elements based on the provided defaultRendererProps and styles.
 * It iterates over the children of the tnode object in defaultRendererProps, and for each child,
 * it checks if the child's tagName is 'emoji'. If it is, it creates an EmojiWithTooltip component
 * with the appropriate styles and adds it to the elements array. If it's not, it adds the child's
 * 'data' property to the elements array. The function then returns the elements array.
 *
 * @param defaultRendererProps - The default renderer props.
 * @param textStyles - The text styles.
 * @param styles - The theme styles.
 * @returns The array of elements to be rendered.
 */
function renderElements(defaultRendererProps: TDefaultRendererProps<TTextOrTPhrasing>, textStyles: StyleProp<TextStyle>, styles: ThemeStyles) {
    const elements: Array<string | React.JSX.Element> = [];

    if ('data' in defaultRendererProps.tnode) {
        elements.push(defaultRendererProps.tnode.data);
        return elements;
    }

    if (!defaultRendererProps.tnode.children) {
        return elements;
    }

    for (const child of defaultRendererProps.tnode.children) {
        if (!('data' in child)) {
            continue;
        }

        if (child.tagName === 'emoji') {
            elements.push(
                <EmojiWithTooltip
                    style={[textStyles, styles.cursorDefault, styles.emojiDefaultStyles]}
                    key={child.data}
                    emojiCode={child.data}
                />,
            );
        } else {
            elements.push(child.data);
        }
    }

    return elements;
}

function InlineCodeBlock<TComponent extends TTextOrTPhrasing>({TDefaultRenderer, textStyle, defaultRendererProps, boxModelStyle}: InlineCodeBlockProps<TComponent>) {
    const styles = useThemeStyles();
    const flattenTextStyle = StyleSheet.flatten(textStyle);
    const {textDecorationLine, ...textStyles} = flattenTextStyle;

    const elements = renderElements(defaultRendererProps, textStyles, styles);

    return (
        <TDefaultRenderer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...defaultRendererProps}
        >
            <Text style={[boxModelStyle, textStyles]}>{elements}</Text>
        </TDefaultRenderer>
    );
}
InlineCodeBlock.displayName = 'InlineCodeBlock';

export default InlineCodeBlock;
