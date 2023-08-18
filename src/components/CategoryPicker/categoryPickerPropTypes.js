import PropTypes from 'prop-types';
import categoryPropTypes from '../categoryPropTypes';

const propTypes = {
    /** The policyID of we are getting categories */
    policyID: PropTypes.string,

    /** Collection of categories attached to a policy */
    policyCategories: PropTypes.objectOf(categoryPropTypes),
};

const defaultProps = {
    policyID: '',
    policyCategories: null,
};

export {propTypes, defaultProps};
