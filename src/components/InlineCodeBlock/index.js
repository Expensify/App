import React from 'react';
import inlineCodeBlockPropTypes from './inlineCodeBlockPropTypes';
import ExpensifyText from '../ExpensifyText';

const InlineCodeBlock = (props) => {
    const TDefaultRenderer = props.TDefaultRenderer;
    return (
        <TDefaultRenderer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props.defaultRendererProps}
        >
            <ExpensifyText
                style={{...props.boxModelStyle, ...props.textStyle}}
            >
                {props.defaultRendererProps.tnode.data}
            </ExpensifyText>
        </TDefaultRenderer>
    );
};

InlineCodeBlock.propTypes = inlineCodeBlockPropTypes;
InlineCodeBlock.displayName = 'InlineCodeBlock';
export default InlineCodeBlock;
