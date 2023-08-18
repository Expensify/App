import PropTypes from 'prop-types';
import categoryPropTypes from '../categoryPropTypes';

const propTypes = {
    /** The report ID of the IOU */
    reportID: PropTypes.string,

    /** The policyID of we are getting categories */
    policyID: PropTypes.string,

    /** The type of IOU report, i.e. bill, request, send */
    iouType: PropTypes.string,

    /** Collection of categories attached to a policy */
    policyCategories: PropTypes.objectOf(categoryPropTypes),
};

const defaultProps = {
    policyID: '',
    policyCategories: null,
};

export {propTypes, defaultProps};
