import CONST from '@src/CONST';
import type {NavigationBarType} from './types';

function getNavigationBarType(): NavigationBarType {
    // On web, there is no navigation bar.
    return CONST.NAVIGATION_BAR_TYPE.NONE;
}

export default getNavigationBarType;
