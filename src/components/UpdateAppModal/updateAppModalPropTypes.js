import PropTypes from 'prop-types';

const propTypes = {
    /** Callback to fire when we want to trigger the update. */
    onSubmit: PropTypes.func,
};

const defaultProps = {
    onSubmit: null,
};

export {propTypes, defaultProps};
