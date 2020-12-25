import React from 'react';
import inlineCodeBlockPropTypes from './inlineCodeBlockPropTypes';

const InlineCodeBlock = ({
    TDefaultRenderer,
    defaultRendererProps,
    boxModelStyle,
    textStyle,
}) => (
    <TDefaultRenderer
        style={{
            ...boxModelStyle,
            ...textStyle,

            // Inline styles should be avoided, but this is the only place
            // where we should be using display: inline-block as it is not
            // supported by any React Native components.
            display: 'inline-block',
        }}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...defaultRendererProps}
    />
);

InlineCodeBlock.propTypes = inlineCodeBlockPropTypes;
InlineCodeBlock.displayName = 'InlineCodeBlock';
export default InlineCodeBlock;
