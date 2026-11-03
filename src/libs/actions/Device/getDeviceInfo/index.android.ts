import type {GetDeviceInfo} from './types';

import getBaseInfo from './getBaseInfo';
import getOSAndName from './getOSAndName/index';

const getDeviceInfo: GetDeviceInfo = () => ({
    ...getBaseInfo(),
    ...getOSAndName(),
    os: 'Android',
});

export default getDeviceInfo;
