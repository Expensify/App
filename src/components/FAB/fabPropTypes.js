import PropTypes from 'prop-types';

const fabPropTypes = {
    // Callback to fire on request to toggle the FAB
    onPress: PropTypes.func.isRequired,

    // Current state (active or not active) of the component
    isActive: PropTypes.bool.isRequired,
};

export default fabPropTypes;
