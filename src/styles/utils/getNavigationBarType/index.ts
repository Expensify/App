import {NAVIGATION_BAR_TYPE} from '@expensify/nitro-utils';
import type GetNavigationBarType from './types';

const getNavigationBarType: GetNavigationBarType = () => {
    // On web, there is no navigation bar.
    return NAVIGATION_BAR_TYPE.NONE;
};

export default getNavigationBarType;
