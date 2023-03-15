import React from 'react';
import styles from '../../styles/styles';
import WrappedText from './WrappedText';
import inlineCodeBlockPropTypes from './inlineCodeBlockPropTypes';

const InlineCodeBlock = (props) => {
    const TDefaultRenderer = props.TDefaultRenderer;
    return (
        <TDefaultRenderer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props.defaultRendererProps}
        >
            <WrappedText
                textStyles={[props.textStyle]}
                wordStyles={[props.boxModelStyle, styles.codeWordStyle]}
            >
                {props.defaultRendererProps.tnode.data}
            </WrappedText>
        </TDefaultRenderer>
    );
};

InlineCodeBlock.propTypes = inlineCodeBlockPropTypes;
InlineCodeBlock.displayName = 'InlineCodeBlock';
export default InlineCodeBlock;
