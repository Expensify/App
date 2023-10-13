import PropTypes from 'prop-types';
import CONST from '@src/CONST';
import {imagePropTypes} from './Image/imagePropTypes';

export default PropTypes.shape({
    source: PropTypes.oneOfType([PropTypes.string, PropTypes.func, imagePropTypes.source]),
    avatarImageName: PropTypes.string,
    type: PropTypes.oneOf([CONST.ICON_TYPE_AVATAR, CONST.ICON_TYPE_WORKSPACE]),
    name: PropTypes.string,
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    fallbackIcon: PropTypes.oneOfType([PropTypes.func, PropTypes.string, imagePropTypes.source]),
});
