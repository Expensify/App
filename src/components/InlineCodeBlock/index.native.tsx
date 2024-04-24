import React from 'react';
import useThemeStyles from '@hooks/useThemeStyles';
import type InlineCodeBlockProps from './types';
import type {TTextOrTPhrasing} from './types';
import WrappedText from './WrappedText';
import getCurrentData from './getCurrentData';

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
