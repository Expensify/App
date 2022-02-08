import PropTypes from 'prop-types';
import {withLocalizePropTypes} from '../../../../../components/withLocalize';
import CONST from '../../../../../CONST';

const propTypes = {
    /** Whether or not this IOU has multiple participants */
    hasMultipleParticipants: PropTypes.bool.isRequired,

    /** The ID of the report this screen should display */
    reportID: PropTypes.string.isRequired,

    /** Callback to inform parent modal of success */
    onStepComplete: PropTypes.func.isRequired,

    /** The currency list constant object from Onyx */
    currencyList: PropTypes.objectOf(PropTypes.shape({
        /** Symbol for the currency */
        symbol: PropTypes.string,

        /** Name of the currency */
        name: PropTypes.string,

        /** ISO4217 Code for the currency */
        ISO4217: PropTypes.string,
    })).isRequired,

    /** Previously selected amount to show if the user comes back to this screen */
    selectedAmount: PropTypes.string.isRequired,


    /* Onyx Props */

    /** Holds data related to IOU view state, rather than the underlying IOU data. */
    iou: PropTypes.shape({

        /** Whether or not the IOU step is loading (retrieving users preferred currency) */
        loading: PropTypes.bool,

        /** Selected Currency Code of the current IOU */
        selectedCurrencyCode: PropTypes.string,
    }),

    /** Brings focus to textInput on updates */
    focusTextInput: PropTypes.func.isRequired,

    /** Calculate values of amount and selection on Keypress */
    calculateAmountAndSelection: PropTypes.func.isRequired,

    /** Replaces each character by calling `convertFn`. */
    replaceAllDigits: PropTypes.func.isRequired,

    /** Returns amount without commas */
    stripCommaFromAmount: PropTypes.func.isRequired,

    /** Validate the new value of amount on keypress */
    validateAmount: PropTypes.func.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    iou: {
        selectedCurrencyCode: CONST.CURRENCY.USD,
    },
};
export {
    defaultProps,
    propTypes,
};
