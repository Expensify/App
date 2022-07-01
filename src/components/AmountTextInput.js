import React from 'react';
import PropTypes from 'prop-types';
import TextInput from './TextInput';
import styles from '../styles/styles';
import CONST from '../CONST';

const propTypes = {
    /** Formatted amount in local currency  */
    formattedAmount: PropTypes.string.isRequired,

    /** A ref to forward to amount text input */
    forwardedRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({current: PropTypes.instanceOf(React.Component)}),
    ]),

    /** Function to call when amount in text input is changed */
    onChangeAmount: PropTypes.func.isRequired,

    /** Placeholder value for amount text input */
    placeholder: PropTypes.string.isRequired,
};

const defaultProps = {
    forwardedRef: undefined,
};

function AmountTextInput(props) {
    return (
        <TextInput
            disableKeyboard
            autoGrow
            hideFocusedState
            inputStyle={[styles.iouAmountTextInput, styles.p0, styles.noLeftBorderRadius, styles.noRightBorderRadius]}
            textInputContainerStyles={[styles.borderNone, styles.noLeftBorderRadius, styles.noRightBorderRadius]}
            onChangeText={props.onChangeAmount}
            ref={props.forwardedRef}
            value={props.formattedAmount}
            placeholder={props.placeholder}
            keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
            blurOnSubmit={false}
        />
    );
}

AmountTextInput.propTypes = propTypes;
AmountTextInput.defaultProps = defaultProps;
AmountTextInput.displayName = 'AmountTextInput';

export default React.forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <AmountTextInput {...props} forwardedRef={ref} />
));
