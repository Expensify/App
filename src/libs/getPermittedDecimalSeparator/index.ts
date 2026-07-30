import getOperatingSystem from '@libs/getOperatingSystem';

import CONST from '@src/CONST';

import type GetPermittedDecimalSeparator from './types';

import getPermittedDecimalSeparatorIOS from './index.ios';

const getPermittedDecimalSeparator: GetPermittedDecimalSeparator = (localizedSeparator) => {
    if (getOperatingSystem() === CONST.OS.IOS) {
        return getPermittedDecimalSeparatorIOS(localizedSeparator);
    }

    return localizedSeparator;
};

export default getPermittedDecimalSeparator;
