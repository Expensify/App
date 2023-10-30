import PropTypes from 'prop-types';
import refPropTypes from '../refPropTypes';

const propTypes = {
    /** A ref to forward to amount text input */
    forwardedRef: refPropTypes,

    /** Formatted amount in local currency  */
    formattedAmount: PropTypes.string.isRequired,

    /** Function to call when amount in text input is changed */
    onChangeAmount: PropTypes.func,

    /** Function to call when currency button is pressed */
    onCurrencyButtonPress: PropTypes.func,

    /** Placeholder value for amount text input */
    placeholder: PropTypes.string.isRequired,

    /** Currency code of user's selected currency */
    selectedCurrencyCode: PropTypes.string.isRequired,

    /** Selection Object */
    selection: PropTypes.shape({
        start: PropTypes.number,
        end: PropTypes.number,
    }),

    /** Function to call when selection in text input is changed */
    onSelectionChange: PropTypes.func,

    /** Function to call to handle key presses in the text input */
    onKeyPress: PropTypes.func,
};

const defaultProps = {
    forwardedRef: undefined,
    onChangeAmount: () => {},
    onCurrencyButtonPress: () => {},
    selection: undefined,
    onSelectionChange: () => {},
    onKeyPress: () => {},
};

export {propTypes, defaultProps};
