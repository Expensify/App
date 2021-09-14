import React from 'react';
import styles from '../../styles/styles';
import WrappedText from './WrappedText';
import inlineCodeBlockPropTypes from './inlineCodeBlockPropTypes';

const InlineCodeBlock = ({
    TDefaultRenderer,
    defaultRendererProps,
    boxModelStyle,
    textStyle,
}) => (
    <TDefaultRenderer
    // eslint-disable-next-line react/jsx-props-no-spreading
        {...defaultRendererProps}
    >
        <WrappedText
            textStyles={[textStyle]}
            wordStyles={[
                boxModelStyle,
                styles.codeWordStyle,
            ]}
        >
            {defaultRendererProps.tnode.data}
        </WrappedText>
    </TDefaultRenderer>
);

InlineCodeBlock.propTypes = inlineCodeBlockPropTypes;
InlineCodeBlock.displayName = 'InlineCodeBlock';
export default InlineCodeBlock;
