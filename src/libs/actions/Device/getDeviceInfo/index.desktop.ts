import getBaseInfo from './getBaseInfo';
import getOSAndName from './getOSAndName/index.native';
import {GetDeviceInfo, DeviceInfo} from "./index";
const getDeviceInfo: GetDeviceInfo = (): DeviceInfo => {
    return {
        ...getBaseInfo(),
        ...getOSAndName(),
        device_name: 'Desktop',
    };
}

export default getDeviceInfo;
