import PropTypes from 'prop-types';
import categoryPropTypes from '../categoryPropTypes';

const propTypes = {
    /** The report ID of the IOU */
    reportID: PropTypes.string.isRequired,

    /** The policyID we are getting categories for */
    policyID: PropTypes.string,

    /** The type of IOU report, i.e. bill, request, send */
    iouType: PropTypes.string.isRequired,

    /* Onyx Props */
    /** Collection of categories attached to a policy */
    policyCategories: PropTypes.objectOf(categoryPropTypes),

    /* Onyx Props */
    /** Collection of categories attached to a policy */
    recentlyUsedPolicyCategories: PropTypes.arrayOf(categoryPropTypes),

    /* Onyx Props */
    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: PropTypes.shape({
        category: PropTypes.string.isRequired,
    }),
};

const defaultProps = {
    policyID: '',
    policyCategories: {},
    recentlyUsedPolicyCategories: {},
    iou: {},
};

export {propTypes, defaultProps};
