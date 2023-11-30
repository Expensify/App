import Text from '@components/Text';
import React from 'react';
import WrappedText from './WrappedText';
import inlineCodeBlockPropTypes from './inlineCodeBlockPropTypes';

function InlineCodeBlock(props) {
    return (
        <Text style={{lineHeight: 22, height: 22}}>
            <WrappedText
                textStyles={[props.textStyle]}
                viewStyles={[props.boxModelStyle]}
            >
                {props.defaultRendererProps.tnode.data}
            </WrappedText>
        </Text>
    );
}

InlineCodeBlock.propTypes = inlineCodeBlockPropTypes;
InlineCodeBlock.displayName = 'InlineCodeBlock';
export default InlineCodeBlock;
