import PropTypes from 'prop-types';

// PropTypes of react-native-gesture-handler's onGestureEvent prop
export default PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({
        current: PropTypes.shape({
            eventNames: PropTypes.arrayOf(PropTypes.string),
            reattachNeeded: PropTypes.bool,
            registrations: PropTypes.arrayOf(PropTypes.number),
            viewTag: PropTypes.number,
            worklet: PropTypes.func,
        }),
    }),
]);
