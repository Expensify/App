import Str from 'expensify-common/lib/str';
import RNDeviceInfo from 'react-native-device-info';
import {GetOSAndName, OSAndName} from "./types";

const getOSAndName: GetOSAndName = (): OSAndName => {
    const deviceName = RNDeviceInfo.getDeviceNameSync();
    const prettyName = `${Str.UCFirst(RNDeviceInfo.getManufacturerSync() || '')} ${deviceName}`;
    return {
        device_name: RNDeviceInfo.isEmulatorSync() ? `Emulator - ${prettyName}` : prettyName,
        os_version: RNDeviceInfo.getSystemVersion(),
    };
}

export default getOSAndName;
