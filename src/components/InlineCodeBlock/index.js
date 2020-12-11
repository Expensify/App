import React from 'react';
import inlineCodeBlockPropTypes from './inlineCodeBlockPropTypes';
import styles from '../../styles/StyleSheet';

const InlineCodeBlock = ({
    TDefaultRenderer,
    defaultRendererProps,
    boxModelStyle,
    textStyle,
}) => (
    <TDefaultRenderer
        style={{...boxModelStyle, ...textStyle, ...styles.dInlineBlock}}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...defaultRendererProps}
    />
);

InlineCodeBlock.propTypes = inlineCodeBlockPropTypes;
InlineCodeBlock.displayName = 'InlineCodeBlock';
export default InlineCodeBlock;
