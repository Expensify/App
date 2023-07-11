import React from 'react';
import _ from 'lodash';
import inlineCodeBlockPropTypes from './inlineCodeBlockPropTypes';
import Text from '../Text';

function InlineCodeBlock(props) {
    const TDefaultRenderer = props.TDefaultRenderer;
    const textStyles = _.omit(props.textStyle, 'textDecorationLine');

    return (
        <TDefaultRenderer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props.defaultRendererProps}
        >
            <Text style={{...props.boxModelStyle, ...textStyles}}>{props.defaultRendererProps.tnode.data}</Text>
        </TDefaultRenderer>
    );
}

InlineCodeBlock.propTypes = inlineCodeBlockPropTypes;
InlineCodeBlock.displayName = 'InlineCodeBlock';
export default InlineCodeBlock;
