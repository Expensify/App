import PropTypes from 'prop-types';

export default PropTypes.shape({
    /** General errors */
    errors: PropTypes.shape({
        /** Key: timestamp - Value: Error message */
    }),

    /** Field specific errors */
    errorFields: PropTypes.shape({
        /** Key: fieldID - bool */
    }),

    /** Is this pending to be added? */
    pendingAction: PropTypes.string,

    /** Plaid account ID of the pending bank account */
    selectedPlaidAccountID: PropTypes.string,

    /** Personal Bank Account successfully added. Show user success modal */
    shouldShowSuccess: PropTypes.bool,

    /** Show loader if still awaiting response */
    isLoading: PropTypes.bool,
});
