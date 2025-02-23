import type {NavigationBarType} from '@libs/NavBarManager/types';
import CONST from '@src/CONST';

function getNavigationBarType(): NavigationBarType {
    // On web, there is no navigation bar.
    return CONST.NAVIGATION_BAR_TYPE.NONE;
}

export default getNavigationBarType;
