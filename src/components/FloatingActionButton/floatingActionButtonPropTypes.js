import PropTypes from 'prop-types';

const floatingActionButtonPropTypes = {
    // Callback to fire on request to toggle the FloatingActionButton
    onPress: PropTypes.func.isRequired,

    // Current state (active or not active) of the component
    isActive: PropTypes.bool.isRequired,
};

export default floatingActionButtonPropTypes;
