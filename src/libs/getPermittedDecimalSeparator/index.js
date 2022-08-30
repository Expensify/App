import getOperatingSystem from '../getOperatingSystem';
import getPermittedDecimalSeparatorIOS from './index.ios';
import CONST from '../../CONST';

export default (localizedSeparator) => {
    if (getOperatingSystem() === CONST.OS.IOS) {
        return getPermittedDecimalSeparatorIOS();
    }

    return localizedSeparator;
};
