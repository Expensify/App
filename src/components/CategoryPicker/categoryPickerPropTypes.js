import PropTypes from 'prop-types';
import categoryPropTypes from '../categoryPropTypes';

const propTypes = {
    /** The policyID we are getting categories for */
    policyID: PropTypes.string,

    /** The selected category of an expense */
    selectedCategory: PropTypes.string,

    /* Onyx Props */
    /** Collection of categories attached to a policy */
    policyCategories: PropTypes.objectOf(categoryPropTypes),

    /* Onyx Props */
    /** Collection of recently used categories attached to a policy */
    policyRecentlyUsedCategories: PropTypes.arrayOf(PropTypes.string),

    /** Callback to fire when a category is pressed */
    onSubmit: PropTypes.func.isRequired,
};

const defaultProps = {
    policyID: '',
    selectedCategory: '',
    policyCategories: {},
    policyRecentlyUsedCategories: [],
};

export {propTypes, defaultProps};
