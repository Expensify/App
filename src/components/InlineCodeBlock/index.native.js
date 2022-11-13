import React from 'react';
import inlineCodeBlockPropTypes from './inlineCodeBlockPropTypes';
import WrappedText from './WrappedText';
import WrappedTextOld from './WrappedTextOld';

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
      {/* <WrappedTextOld
        textStyles={props.textStyle}
        wordStyles={[props.boxModelStyle]}>
        {props.defaultRendererProps.tnode.data}
      </WrappedTextOld> */}
    </TDefaultRenderer>
  );
};

InlineCodeBlock.propTypes = inlineCodeBlockPropTypes;
InlineCodeBlock.displayName = 'InlineCodeBlock';
export default InlineCodeBlock;
