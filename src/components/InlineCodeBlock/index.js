import React from 'react';
import {Text} from 'react-native';
import inlineCodeBlockPropTypes from './inlineCodeBlockPropTypes';

const InlineCodeBlock = (props) => {
    // eslint-disable-next-line react/destructuring-assignment
    const {TDefaultRenderer} = props;
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
