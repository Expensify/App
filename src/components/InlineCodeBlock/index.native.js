import React from 'react';
import _ from 'underscore';
import Text from '@components/Text';
import useThemeStyles from '@styles/useThemeStyles';
import inlineCodeBlockPropTypes from './inlineCodeBlockPropTypes';
import WrappedText from './WrappedText';

function InlineCodeBlock(props) {
    return (
        <WrappedText
            textStyles={[props.textStyle]}
            viewStyles={[props.boxModelStyle]}
        >
            {props.defaultRendererProps.tnode.data}
        </WrappedText>
    );
}

InlineCodeBlock.propTypes = inlineCodeBlockPropTypes;
InlineCodeBlock.displayName = 'InlineCodeBlock';
export default InlineCodeBlock;
