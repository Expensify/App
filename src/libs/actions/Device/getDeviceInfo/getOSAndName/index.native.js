import Str from 'expensify-common/lib/str';
import {
    getDeviceNameSync, getManufacturerSync, getSystemVersion, isEmulatorSync,
} from 'react-native-device-info';

export default function getOSAndName() {
    const deviceName = getDeviceNameSync();
    const prettyName = `${Str.UCFirst((getManufacturerSync() || ''))} ${deviceName}`;
    return {
        device_name: isEmulatorSync() ? `Emulator - ${prettyName}` : prettyName,
        os_version: getSystemVersion(),
    };
}
