import React from 'react';
import inlineCodeBlockPropTypes from './inlineCodeBlockPropTypes';
import {inlineStyles} from '../../styles/styles';

const InlineCodeBlock = ({
    TDefaultRenderer,
    defaultRendererProps,
    boxModelStyle,
    textStyle,
}) => (
    <TDefaultRenderer
        style={{...boxModelStyle, ...textStyle, ...inlineStyles.dInlineBlock}}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...defaultRendererProps}
    />
);

InlineCodeBlock.propTypes = inlineCodeBlockPropTypes;
InlineCodeBlock.displayName = 'InlineCodeBlock';
export default InlineCodeBlock;
