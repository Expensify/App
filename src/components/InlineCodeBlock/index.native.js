import React from 'react';
import styles from '../../styles/styles';
import WrappedText from './WrappedText';
import inlineCodeBlockPropTypes from './inlineCodeBlockPropTypes';

const InlineCodeBlock = ({
    defaultRendererProps,
    boxModelStyle,
    textStyle,
}) => (
    <WrappedText
        textStyle={textStyle}
        wordStyle={{
            ...boxModelStyle,
            ...styles.codeWordStyle,
        }}
        firstWordStyle={styles.codeFirstWordStyle}
        lastWordStyle={styles.codeLastWordStyle}
            // eslint-disable-next-line react/jsx-props-no-spreading
        {...defaultRendererProps}
    >
        {defaultRendererProps.tnode.data}
    </WrappedText>
);

InlineCodeBlock.propTypes = inlineCodeBlockPropTypes;
InlineCodeBlock.displayName = 'InlineCodeBlock';
export default InlineCodeBlock;
