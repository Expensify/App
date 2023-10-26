import PropTypes from 'prop-types';
import _ from 'underscore';
import CONST from '../../CONST';

/** Prop types related to the Terms step of KYC flow */
export default PropTypes.shape({
    /** Any error message to show */
    errors: PropTypes.objectOf(PropTypes.string),

    /** The source that triggered the KYC wall */
    source: PropTypes.oneOf(_.values(CONST.KYC_WALL_SOURCE)),

    /** When the user accepts the Wallet's terms in order to pay an IOU, this is the ID of the chatReport the IOU is linked to */
    chatReportID: PropTypes.string,

    /** Boolean to indicate whether the submission of wallet terms is being processed */
    isLoading: PropTypes.bool,
});
