import PropTypes from 'prop-types';
import {imagePropTypes} from '../Image/imagePropTypes';

const menuItemProps = PropTypes.arrayOf(
    PropTypes.shape({
        icon: PropTypes.oneOfType([PropTypes.elementType, PropTypes.string, imagePropTypes.source]),
        text: PropTypes.string,
        onPress: PropTypes.func,
    }),
);

export default menuItemProps;
