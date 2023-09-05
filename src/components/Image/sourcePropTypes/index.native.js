import PropTypes from 'prop-types';

export default PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
        uri: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        // eslint-disable-next-line react/forbid-prop-types
        headers: PropTypes.object,
    }),
]);
