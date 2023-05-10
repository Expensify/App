import getBaseInfo from './getBaseInfo';
import getOSAndName from './getOSAndName';

/**
 * @typedef DeviceInfo
 * @type {object}
 * @property {string} os
 * @property {string} os_version
 * @property {string} timestamp - ISO without ms
 * @property {string} app_version
 * @property {string} device_name
 * @property {string} [device_version]
 */

/**
 * @returns {DeviceInfo}
 */
export default function getDeviceInfo() {
    return {
        ...getBaseInfo(),
        ...getOSAndName(),
    };
}
