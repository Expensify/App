import PropTypes from 'prop-types';

const menuItemProps = PropTypes.arrayOf(
    PropTypes.shape({
        icon: PropTypes.oneOfType([PropTypes.elementType, PropTypes.string]),
        text: PropTypes.string,
        onPress: PropTypes.func,
    }),
);

export default menuItemProps;
