import PropTypes from 'prop-types';

export default PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.objectOf(
        PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number]))])),
        ]),
    ),
]);
