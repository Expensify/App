import React from 'react';
import propTypes from './propTypes';

const InlineCodeBlock = ({
    TDefaultRenderer,
    defaultRendererProps,
    boxModelStyle,
    textStyle,
}) => (
    <TDefaultRenderer
        style={{...boxModelStyle, ...textStyle}}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...defaultRendererProps}
    />
);

InlineCodeBlock.propTypes = propTypes;
InlineCodeBlock.displayName = 'InlineCodeBlock';
export default InlineCodeBlock;
