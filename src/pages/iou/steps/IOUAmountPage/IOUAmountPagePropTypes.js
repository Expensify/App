import PropTypes from 'prop-types';

const propTypes = {
    /** Previously selected amount to show if the user comes back to this screen */
    selectedAmount: PropTypes.string.isRequired,
};

const defaultProps = {};

export {
    defaultProps,
    propTypes,
};
