import React from 'react';
import useThemeStyles from '@hooks/useThemeStyles';
import renderEmojisAsTextComponents from './renderEmojisAsTextComponents';
import type InlineCodeBlockProps from './types';
import type {TTextOrTPhrasing} from './types';
import WrappedText from './WrappedText';

function InlineCodeBlock<TComponent extends TTextOrTPhrasing>({TDefaultRenderer, defaultRendererProps, textStyle, boxModelStyle}: InlineCodeBlockProps<TComponent>) {
    const styles = useThemeStyles();
    const {elements, hasLargeStyle} = renderEmojisAsTextComponents(defaultRendererProps, styles);

    return (
        <TDefaultRenderer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...defaultRendererProps}
        >
            <WrappedText
                textStyles={textStyle}
                wordStyles={[boxModelStyle, styles.codeWordStyle, hasLargeStyle ? styles.onlyEmojisText : {}]}
            >
                {elements}
            </WrappedText>
        </TDefaultRenderer>
    );
}

InlineCodeBlock.displayName = 'InlineCodeBlock';

export default InlineCodeBlock;
