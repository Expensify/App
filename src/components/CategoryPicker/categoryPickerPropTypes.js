import PropTypes from 'prop-types';
import categoryPropTypes from '../categoryPropTypes';

const propTypes = {
    /** TODO: Comment */
    policyID: PropTypes.string,

    /** TODO: Comment */
    policyCategories: PropTypes.objectOf(categoryPropTypes),
};

const defaultProps = {
    policyID: '',
    policyCategories: null,
};

export {propTypes, defaultProps};
