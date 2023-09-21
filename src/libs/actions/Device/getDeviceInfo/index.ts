import getBaseInfo, {BaseInfo} from './getBaseInfo';
import getOSAndName, {OSAndName} from './getOSAndName/index.native';

export type GetDeviceInfo = () => DeviceInfo;
export type DeviceInfo = BaseInfo & OSAndName & {os?: string, device_name?: string, device_version?: string};
export type GetBaseInfo = () => BaseInfo;
const getDeviceInfo: GetDeviceInfo = () => {
    return {
        ...getBaseInfo(),
        ...getOSAndName(),
    };
}

export default getDeviceInfo;
