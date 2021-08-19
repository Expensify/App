import React from 'react';
import {Text} from 'react-native';
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
        <Text
            style={{...boxModelStyle, ...textStyle}}
        >
            {defaultRendererProps.tnode.data}
        </Text>
    </TDefaultRenderer>
);

InlineCodeBlock.propTypes = inlineCodeBlockPropTypes;
InlineCodeBlock.displayName = 'InlineCodeBlock';
export default InlineCodeBlock;
