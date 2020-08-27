import PropTypes from 'prop-types';

const SafeAreaInsetPropTypes = PropTypes.shape({
    top: PropTypes.number,
    left: PropTypes.number,
    right: PropTypes.number,
    bottom: PropTypes.number,
});

export default SafeAreaInsetPropTypes;
