import React from 'react';
import inlineCodeBlockPropTypes from './inlineCodeBlockPropTypes';
import Text from '../Text';

const InlineCodeBlock = (props) => {
    const TDefaultRenderer = props.TDefaultRenderer;
    return (
        <TDefaultRenderer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props.defaultRendererProps}
        >
            <Text
                style={{...props.boxModelStyle, ...props.textStyle}}
            >
                {props.defaultRendererProps.tnode.data}
            </Text>
        </TDefaultRenderer>
    );
};

InlineCodeBlock.propTypes = inlineCodeBlockPropTypes;
InlineCodeBlock.displayName = 'InlineCodeBlock';
export default InlineCodeBlock;
