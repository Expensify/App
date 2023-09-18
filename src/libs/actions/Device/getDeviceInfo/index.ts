import getBaseInfo, {DeviceInfo} from './getBaseInfo';
import getOSAndName from './getOSAndName/index.native';

/**
 * @typedef DeviceInfo
 * @type {object}

 */

/**
 * @returns {DeviceInfo}
 */
export default function getDeviceInfo(): DeviceInfo {
    return {
        ...getBaseInfo(),
        ...getOSAndName(),
    };
}
