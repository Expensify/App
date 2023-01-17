import PropTypes from 'prop-types';

export default PropTypes.oneOfType([
    // Executes once a gesture is triggered
    PropTypes.func,
    PropTypes.shape({
        current: PropTypes.shape({
            // Array of event names that will be handled by animation handler
            eventNames: PropTypes.arrayOf(PropTypes.string),

            // Array of registered event handlers ids
            registrations: PropTypes.arrayOf(PropTypes.number),

            // React tag of the node we want to manage
            viewTag: PropTypes.number,

            // Executes once a gesture is triggered
            worklet: PropTypes.func,
        }),
    }),
]);
