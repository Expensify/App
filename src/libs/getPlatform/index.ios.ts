import CONST from '@src/CONST';

import type Platform from './types';

export default function getPlatform(_shouldMobileWebBeDistinctFromWeb = false): Platform {
    return CONST.PLATFORM.IOS;
}
