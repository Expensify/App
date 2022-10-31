import PropTypes from 'prop-types';
import stylePropTypes from '../../styles/stylePropTypes';

const propTypes = {
    /* A function to execute when form is submitted with ENTER */
    onSubmit: PropTypes.func.isRequired,

    /** Children to wrap with FormSubmit. */
    children: PropTypes.node.isRequired,

    /** Container styles */
    style: stylePropTypes,
};

const defaultProps = {
    style: [],
};

export {propTypes, defaultProps};
