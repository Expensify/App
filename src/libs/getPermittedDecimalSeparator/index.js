import getOperatingSystem from '@libs/getOperatingSystem';
import CONST from '@src/CONST';
import getPermittedDecimalSeparatorIOS from './index.ios';

export default (localizedSeparator) => {
    if (getOperatingSystem() === CONST.OS.IOS) {
        return getPermittedDecimalSeparatorIOS();
    }

    return localizedSeparator;
};
