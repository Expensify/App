import React from 'react';
import useThemeStyles from '@hooks/useThemeStyles';
import type {TDefaultRendererProps} from 'react-native-render-html';
import type InlineCodeBlockProps from './types';
import type {TTextOrTPhrasing} from './types';
import WrappedText from './WrappedText';

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
