import {FallbackAvatar} from '@components/Icon/Expensicons';
import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';

const fallbackIcon: Icon = {
    source: FallbackAvatar,
    type: CONST.ICON_TYPE_AVATAR,
    name: '',
    id: -1,
};

export default fallbackIcon;
