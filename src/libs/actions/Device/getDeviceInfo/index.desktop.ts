import getBaseInfo, {DeviceInfo} from './getBaseInfo';
import getOSAndName from './getOSAndName/index.native';
export default function getDeviceInfo(): DeviceInfo {
    return {
        ...getBaseInfo(),
        ...getOSAndName(),
        device_name: 'Desktop',
    };
}
