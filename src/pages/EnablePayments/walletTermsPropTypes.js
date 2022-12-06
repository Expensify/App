import PropTypes from 'prop-types';

/** Prop types related to the Terms step of KYC flow */
export default PropTypes.shape({
    /** Any error message to show */
    errors: PropTypes.objectOf(PropTypes.string),

    /** When the user accepts the Wallet's terms in order to pay an IOU, this is the ID of the chatReport the IOU is linked to */
    chatReportID: PropTypes.string,
});
