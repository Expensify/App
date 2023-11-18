import React from 'react';
import styles from '@styles/styles';
import inlineCodeBlockPropTypes from './inlineCodeBlockPropTypes';
import WrappedText from './WrappedText';

function InlineCodeBlock(props) {
    const TDefaultRenderer = props.TDefaultRenderer;
    console.error(props.defaultRendererProps)
    return (
        <TDefaultRenderer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props.defaultRendererProps}
        >
            <WrappedText
                // textStyles={[props.textStyle]}
                // boxModelStyle={[props.boxModelStyle]}
                // wordStyles={[styles.codeWordStyle]}
            >
                {props.defaultRendererProps.tnode.data}
            </WrappedText>
        </TDefaultRenderer>
    );
}

InlineCodeBlock.propTypes = inlineCodeBlockPropTypes;
InlineCodeBlock.displayName = 'InlineCodeBlock';
export default InlineCodeBlock;
