import Str from 'expensify-common/lib/str';
import {
    getDeviceNameSync, getManufacturerSync, getSystemVersion,
} from 'react-native-device-info';

export default function getOSAndName() {
    const deviceName = getDeviceNameSync();
    const isEmulator = deviceName.startsWith('sdk');
    const prettyName = `${Str.UCFirst((getManufacturerSync() || ''))} ${deviceName}`;
    return {
        device_name: isEmulator ? `Emulator - ${prettyName}` : prettyName,
        os_version: getSystemVersion(),
    };
}
