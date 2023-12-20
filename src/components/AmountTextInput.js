import PropTypes from 'prop-types';
import React from 'react';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import refPropTypes from './refPropTypes';
import TextInput from './TextInput';

const propTypes = {
    /** Formatted amount in local currency  */
    formattedAmount: PropTypes.string.isRequired,

    /** A ref to forward to amount text input */
    forwardedRef: refPropTypes,

    /** Function to call when amount in text input is changed */
    onChangeAmount: PropTypes.func.isRequired,

    /** Placeholder value for amount text input */
    placeholder: PropTypes.string.isRequired,

    /** Selection Object */
    selection: PropTypes.shape({
        start: PropTypes.number,
        end: PropTypes.number,
    }),

    /** Function to call when selection in text input is changed */
    onSelectionChange: PropTypes.func,

    /** Style for the input */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    /** Style for the container */
    containerStyles: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    /** Function to call to handle key presses in the text input */
    onKeyPress: PropTypes.func,
};

const defaultProps = {
    forwardedRef: undefined,
    selection: undefined,
    onSelectionChange: () => {},
    onKeyPress: () => {},
    style: {},
    containerStyles: {},
};

function AmountTextInput(props) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    return (
        <TextInput
            disableKeyboard
            autoGrow
            hideFocusedState
            inputStyle={[styles.iouAmountTextInput, styles.p0, styles.noLeftBorderRadius, styles.noRightBorderRadius, ...StyleUtils.parseStyleAsArray(props.style)]}
            textInputContainerStyles={[styles.borderNone, styles.noLeftBorderRadius, styles.noRightBorderRadius]}
            onChangeText={props.onChangeAmount}
            ref={props.forwardedRef}
            value={props.formattedAmount}
            placeholder={props.placeholder}
            inputMode={CONST.INPUT_MODE.NUMERIC}
            blurOnSubmit={false}
            selection={props.selection}
            onSelectionChange={props.onSelectionChange}
            role={CONST.ROLE.PRESENTATION}
            onKeyPress={props.onKeyPress}
            containerStyles={[...StyleUtils.parseStyleAsArray(props.containerStyles)]}
        />
    );
}

AmountTextInput.propTypes = propTypes;
AmountTextInput.defaultProps = defaultProps;
AmountTextInput.displayName = 'AmountTextInput';

const AmountTextInputWithRef = React.forwardRef((props, ref) => (
    <AmountTextInput
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

AmountTextInputWithRef.displayName = 'AmountTextInputWithRef';

export default AmountTextInputWithRef;
