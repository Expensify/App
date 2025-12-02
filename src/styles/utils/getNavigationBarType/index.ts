import CONST from '@src/CONST';
import type GetNavigationBarType from './types';

const getNavigationBarType: GetNavigationBarType = () => {
    // On web, there is no navigation bar.
    return CONST.NAVIGATION_BAR_TYPE.NONE;
};

export default getNavigationBarType;
