import PropTypes from 'prop-types';
import CONST from '@src/CONST';

export default PropTypes.shape({
    source: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    type: PropTypes.oneOf([CONST.ICON_TYPE_AVATAR, CONST.ICON_TYPE_WORKSPACE]),
    name: PropTypes.string,
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    fallbackIcon: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
});
