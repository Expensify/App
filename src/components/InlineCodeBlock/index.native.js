import React from 'react';
import Text from '@components/Text';
import useThemeStyles from '@styles/useThemeStyles';
import inlineCodeBlockPropTypes from './inlineCodeBlockPropTypes';
import WrappedText from './WrappedText';

function InlineCodeBlock(props) {
    console.error('INLINE CODE BLOCK');
    console.error(props);
    const TDefaultRenderer = props.TDefaultRenderer;
    // const data = getNativeProps
    return (
        <TDefaultRenderer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props.defaultRendererProps}
        >
            <WrappedText
                textStyles={[props.textStyle]}
                viewStyles={[props.boxModelStyle, {top: 100}]}
            >
                {props.defaultRendererProps.tnode.data}
            </WrappedText>
        </TDefaultRenderer>
    );
}

InlineCodeBlock.propTypes = inlineCodeBlockPropTypes;
InlineCodeBlock.displayName = 'InlineCodeBlock';
export default InlineCodeBlock;
