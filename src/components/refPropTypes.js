import PropTypes from 'prop-types';

export default PropTypes.oneOfType([
    PropTypes.func,
    // eslint-disable-next-line react/forbid-prop-types
    PropTypes.shape({current: PropTypes.any}),
]);
