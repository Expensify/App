import * as Browser from '@libs/Browser';

import CONST from '@src/CONST';

import type {GetPlatform} from './types';

const getPlatform: GetPlatform = (shouldMobileWebBeDistinctFromWeb = false) => {
    if (shouldMobileWebBeDistinctFromWeb && Browser.isMobile()) {
        return CONST.PLATFORM.MOBILE_WEB;
    }
    return CONST.PLATFORM.WEB;
};

export default getPlatform;
