import getOperatingSystem from '@libs/getOperatingSystem';
import CONST from '@src/CONST';
import getPermittedDecimalSeparatorIOS from './index.ios';
import GetPermittedDecimalSeparator from './types';

const getPermittedDecimalSeparator: GetPermittedDecimalSeparator = (localizedSeparator) => {
    if (getOperatingSystem() === CONST.OS.IOS) {
        return getPermittedDecimalSeparatorIOS(localizedSeparator);
    }

    return localizedSeparator;
};

export default getPermittedDecimalSeparator;
