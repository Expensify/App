import PropTypes from "prop-types";

export default PropTypes.shape({
    /** IOU amount saved in Onyx */
    amount: PropTypes.number,

    /** Currency chosen by user or saved in Onyx */
    currency: PropTypes.string,

    /** Title to be displayed in the header */
    title: PropTypes.string,

    /** Whether the amount is being edited or not */
    isEditing: PropTypes.bool,

    /** Fired when back button pressed, navigates back to a proper page */
    onBackButtonPress: PropTypes.func.isRequired,

    /** Fired when back button pressed, navigates to currency selection page */
    onCurrencyButtonPress: PropTypes.func.isRequired,

    /** Fired when submit button pressed, saves the given amount and navigates to the next page */
    onSubmitButtonPress: PropTypes.func.isRequired,
});
