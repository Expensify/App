import React from 'react';
import BaseTextInputAutoWidthWithoutKeyboard from './BaseTextInputAutoWidthWithoutKeyboard';
import * as baseTextInputAutoWidthWithoutKeyboardPropTypes from './baseTextInputAutoWidthWithoutKeyboardPropTypes';

class TextInputAutoWidthWithoutKeyboard extends React.Component {
    componentDidMount() {
        this.textInput.setNativeProps({inputmode: 'none'});
    }

    render() {
        return (
            <BaseTextInputAutoWidthWithoutKeyboard
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
                ref={(el) => {
                    this.textInput = el;
                    this.props.forwardedRef(el);
                }}
            />
        );
    }
}

TextInputAutoWidthWithoutKeyboard.propTypes = baseTextInputAutoWidthWithoutKeyboardPropTypes.propTypes;
TextInputAutoWidthWithoutKeyboard.defaultProps = baseTextInputAutoWidthWithoutKeyboardPropTypes.defaultProps;

export default React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <TextInputAutoWidthWithoutKeyboard {...props} forwardedRef={ref} />
));
