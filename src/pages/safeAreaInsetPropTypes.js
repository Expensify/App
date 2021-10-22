import PropTypes from 'prop-types';

const safeAreaInsetPropTypes = PropTypes.shape({
    top: PropTypes.number,
    left: PropTypes.number,
    right: PropTypes.number,
    bottom: PropTypes.number,
});

export default safeAreaInsetPropTypes;
