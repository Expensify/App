import getBaseInfo from './getBaseInfo';
import getOSAndName from './getOSAndName/index.native';
import {GetDeviceInfo, DeviceInfo} from './types';
const getDeviceInfo: GetDeviceInfo = (): DeviceInfo => {
    return {
        ...getBaseInfo(),
        ...getOSAndName(),
        os: 'iOS',
    };
}

export default getDeviceInfo;
