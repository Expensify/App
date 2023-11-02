import PropTypes from 'prop-types';
import sourcePropTypes from '@components/Image/sourcePropTypes';

const menuItemProps = PropTypes.arrayOf(
    PropTypes.shape({
        icon: PropTypes.oneOfType([PropTypes.string, sourcePropTypes]),
        text: PropTypes.string,
        onPress: PropTypes.func,
    }),
);

export default menuItemProps;
