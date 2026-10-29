import type {GetDeviceInfo} from './types';

import getBaseInfo from './getBaseInfo';
import getOSAndName from './getOSAndName/index';

const getDeviceInfo: GetDeviceInfo = () => ({
    ...getBaseInfo(),
    ...getOSAndName(),
});

export default getDeviceInfo;
