import PropTypes from 'prop-types';

export default PropTypes.shape({
    /** Message attached to the report closed action */
    originalMessage: PropTypes.shape({
        /** The reason the report was closed */
        reason: PropTypes.string.isRequired,

        /** (For accountMerged reason only), the email of the previous owner of this report. */
        oldLogin: PropTypes.string,

        /** (For accountMerged reason only), the email of the account the previous owner was merged into */
        newLogin: PropTypes.string,
    }).isRequired,
});
