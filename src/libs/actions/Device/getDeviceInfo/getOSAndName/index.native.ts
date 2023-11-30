import Str from 'expensify-common/lib/str';
import RNDeviceInfo from 'react-native-device-info';
import {GetOSAndName} from './types';

const getOSAndName: GetOSAndName = () => {
    const deviceName = RNDeviceInfo.getDeviceNameSync();
    const prettyName = `${Str.UCFirst(RNDeviceInfo.getManufacturerSync() || '')} ${deviceName}`;
    return {
        deviceName: RNDeviceInfo.isEmulatorSync() ? `Emulator - ${prettyName}` : prettyName,
        osVersion: RNDeviceInfo.getSystemVersion(),
    };
};

export default getOSAndName;
