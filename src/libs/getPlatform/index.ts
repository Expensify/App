import CONST from '@src/CONST';
import type Platform from './types';

export default function getPlatform(): Platform {
    return CONST.PLATFORM.WEB;
}
