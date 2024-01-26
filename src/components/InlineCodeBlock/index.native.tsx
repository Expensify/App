import React from 'react';
import type {TText} from 'react-native-render-html';
import useThemeStyles from '@hooks/useThemeStyles';
import type InlineCodeBlockProps from './types';
import WrappedText from './WrappedText';

function InlineCodeBlock<TComponent extends TText>({TDefaultRenderer, defaultRendererProps, textStyle, boxModelStyle}: InlineCodeBlockProps<TComponent>) {
    const styles = useThemeStyles();

    return (
        <TDefaultRenderer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...defaultRendererProps}
        >
            <WrappedText
                textStyles={textStyle}
                wordStyles={[boxModelStyle, styles.codeWordStyle]}
            >
                {defaultRendererProps.tnode.data}
            </WrappedText>
        </TDefaultRenderer>
    );
}

InlineCodeBlock.displayName = 'InlineCodeBlock';

export default InlineCodeBlock;
