import getOperatingSystem from '../getOperatingSystem';
import getPermittedDecimalSeparatorIOS from './index.ios';
import CONST from '../../CONST';
import GetPermittedDecimalSeparator from './types';

const getPermittedDecimalSeparator: GetPermittedDecimalSeparator = (localizedSeparator) => {
    if (getOperatingSystem() === CONST.OS.IOS) {
        return getPermittedDecimalSeparatorIOS(localizedSeparator);
    }

    return localizedSeparator ?? '.';
};

export default getPermittedDecimalSeparator;
