import CONST from '@src/CONST';
import type Platform from './types';
import * as Browser from '@libs/Browser';

export default function getPlatform(treatMWebDifferently = false): Platform {
    if (treatMWebDifferently && Browser.isMobile()) {
        return CONST.PLATFORM.MOBILEWEB;
    }
    return CONST.PLATFORM.WEB;
}
