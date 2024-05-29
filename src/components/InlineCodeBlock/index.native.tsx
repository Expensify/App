import React from 'react';
import type {TDefaultRendererProps} from 'react-native-render-html';
import useThemeStyles from '@hooks/useThemeStyles';
import type InlineCodeBlockProps from './types';
import type {TTextOrTPhrasing} from './types';
import WrappedText from './WrappedText';

/**
 * Retrieves the text content from a Text or Phrasing node.
 *
 * @param defaultRendererProps - The default renderer props containing the node information.
 * @returns The text content of the node.
 *
 * @template TTextOrTPhrasing
 */
function getCurrentData(defaultRendererProps: TDefaultRendererProps<TTextOrTPhrasing>): string {
    if ('data' in defaultRendererProps.tnode) {
        return defaultRendererProps.tnode.data;
    }
    return defaultRendererProps.tnode.children.map((child) => ('data' in child ? child.data : '')).join('');
}

function InlineCodeBlock<TComponent extends TTextOrTPhrasing>({TDefaultRenderer, defaultRendererProps, textStyle, boxModelStyle}: InlineCodeBlockProps<TComponent>) {
    const styles = useThemeStyles();
    const data = getCurrentData(defaultRendererProps);

    return (
        <TDefaultRenderer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...defaultRendererProps}
        >
            <WrappedText
                textStyles={textStyle}
                wordStyles={[boxModelStyle, styles.codeWordStyle]}
            >
                {data}
            </WrappedText>
        </TDefaultRenderer>
    );
}

InlineCodeBlock.displayName = 'InlineCodeBlock';

export default InlineCodeBlock;
