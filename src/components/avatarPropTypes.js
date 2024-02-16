import PropTypes from 'prop-types';
import CONST from '@src/CONST';
import sourcePropTypes from './Image/sourcePropTypes';

export default PropTypes.shape({
    source: PropTypes.oneOfType([PropTypes.string, sourcePropTypes]),
    type: PropTypes.oneOf([CONST.ICON_TYPE_AVATAR, CONST.ICON_TYPE_WORKSPACE]),
    name: PropTypes.string,
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    fallbackIcon: PropTypes.oneOfType([PropTypes.string, sourcePropTypes]),
});
