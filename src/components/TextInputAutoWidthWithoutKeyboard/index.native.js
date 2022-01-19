import React from 'react';
import BaseTextInputAutoWidthWithoutKeyboard from './BaseTextInputAutoWidthWithoutKeyboard';
import * as baseTextInputAutoWidthWithoutKeyboardPropTypes from './baseTextInputAutoWidthWithoutKeyboardPropTypes';

const TextInputAutoWidthWithoutKeyboard = props => (
    <BaseTextInputAutoWidthWithoutKeyboard
    // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        ref={props.forwardedRef}
    />
);

TextInputAutoWidthWithoutKeyboard.propTypes = baseTextInputAutoWidthWithoutKeyboardPropTypes.propTypes;
TextInputAutoWidthWithoutKeyboard.defaultProps = baseTextInputAutoWidthWithoutKeyboardPropTypes.defaultProps;
TextInputAutoWidthWithoutKeyboard.displayName = 'TextInputAutoWidthWithoutKeyboard';

export default React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <TextInputAutoWidthWithoutKeyboard {...props} forwardedRef={ref} />
));
