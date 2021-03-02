import PropTypes from 'prop-types';

const propTypes = {
    // Callback to fire when we want to trigger the update.
    onSubmit: PropTypes.func,

    // Version string for the app to update to.
    // eslint-disable-next-line react/no-unused-prop-types
    version: PropTypes.string,
};

const defaultProps = {
    onSubmit: null,
    version: '',
};

export {propTypes, defaultProps};
