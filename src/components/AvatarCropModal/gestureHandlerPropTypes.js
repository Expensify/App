import PropTypes from 'prop-types';

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
