import getBaseInfo from './getBaseInfo';
import getOSAndName from './getOSAndName/index.native';
import {GetDeviceInfo, DeviceInfo} from "./index";

const getDeviceInfo: GetDeviceInfo = (): DeviceInfo => {
    return {
        ...getBaseInfo(),
        ...getOSAndName(),
        os: 'Android',
    };
}

export default getDeviceInfo;
