import getBaseInfo from './getBaseInfo';
import getOSAndName from './getOSAndName/index';
import type {GetDeviceInfo} from './types';

const getDeviceInfo: GetDeviceInfo = () => ({
    ...getBaseInfo(),
    ...getOSAndName(),
});

export default getDeviceInfo;
