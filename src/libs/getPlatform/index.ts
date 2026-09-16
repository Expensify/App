import * as Browser from '@libs/Browser';

import CONST from '@src/CONST';

import type Platform from './types';

export default function getPlatform(shouldMobileWebBeDistinctFromWeb = false): Platform {
    if (shouldMobileWebBeDistinctFromWeb && Browser.isMobile()) {
        return CONST.PLATFORM.MOBILE_WEB;
    }
    return CONST.PLATFORM.WEB;
}

// Demo only: gives this PR a src change so reassurePerformanceTests.yml is not skipped by paths-ignore.
