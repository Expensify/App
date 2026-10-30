/**
 * Corrects the Windows version reported by the User-Agent string. Browsers freeze it at "Windows NT 10.0",
 * so Windows 11 shows up as Windows 10. User-Agent Client Hints expose the real platform version where supported.
 * https://learn.microsoft.com/en-us/microsoft-edge/web-platform/how-to-detect-win11
 */
import Log from '@libs/Log';

import type {DeviceInfo} from '@userActions/Device/getDeviceInfo/types';

import CONST from '@src/CONST';

import type ResolveWindowsVersion from './types';

// Client Hints report a platformVersion major of 13 or higher on Windows 11, and 1-10 on Windows 10
const MIN_WINDOWS_11_PLATFORM_MAJOR_VERSION = 13;
const WINDOWS_11_OS_VERSION = '11';

const resolveWindowsVersion: ResolveWindowsVersion = async (deviceInfo: DeviceInfo) => {
    const userAgentData = navigator.userAgentData;
    if (deviceInfo.os !== CONST.OS.WINDOWS || !userAgentData?.getHighEntropyValues) {
        return deviceInfo;
    }

    try {
        const {platformVersion} = await userAgentData.getHighEntropyValues(['platformVersion']);
        const platformMajorVersion = parseInt(platformVersion?.split('.').at(0) ?? '', 10);
        if (platformMajorVersion >= MIN_WINDOWS_11_PLATFORM_MAJOR_VERSION) {
            return {...deviceInfo, osVersion: WINDOWS_11_OS_VERSION};
        }
    } catch (error) {
        // Keep the User-Agent version when the browser refuses the Client Hints request
        Log.info('Unable to read the Windows platform version from Client Hints', false, {error: String(error)});
    }

    return deviceInfo;
};

export default resolveWindowsVersion;
