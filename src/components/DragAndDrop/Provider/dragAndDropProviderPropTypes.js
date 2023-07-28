import PropTypes from 'prop-types';

export default {
    /** Children to render inside this component. */
    children: PropTypes.node.isRequired,

    /** Should this dropZone be disabled? */
    isDisabled: PropTypes.bool,
};
