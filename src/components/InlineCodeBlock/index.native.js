import React from 'react';
import inlineCodeBlockPropTypes from './inlineCodeBlockPropTypes';
import WrappedText from './WrappedText';

const InlineCodeBlock = (props) => {
  const TDefaultRenderer = props.TDefaultRenderer;
  return (
    <TDefaultRenderer
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props.defaultRendererProps}>
      <WrappedText
        textStyles={props.textStyle}
        wordStyles={[props.boxModelStyle]}>
        {props.defaultRendererProps.tnode.data}
      </WrappedText>
    </TDefaultRenderer>
  );
};

InlineCodeBlock.propTypes = inlineCodeBlockPropTypes;
InlineCodeBlock.displayName = 'InlineCodeBlock';
export default InlineCodeBlock;
