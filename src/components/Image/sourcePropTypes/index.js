import PropTypes from 'prop-types';

export default PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.elementType,
    PropTypes.number,
    PropTypes.shape({
        uri: PropTypes.string,
        // eslint-disable-next-line react/forbid-prop-types
        headers: PropTypes.object,
    }),
    PropTypes.string,
]);
