import Str from 'expensify-common/lib/str';
import RNDeviceInfo from 'react-native-device-info';
import GetOSAndName from './types';

const getOSAndName: GetOSAndName = () => {
    const deviceName = RNDeviceInfo.getDeviceNameSync();
    const prettyName = `${Str.UCFirst(RNDeviceInfo.getManufacturerSync() || '')} ${deviceName}`;
    return {
        // Parameter names are predefined and we don't choose it here
        // eslint-disable-next-line @typescript-eslint/naming-convention
        device_name: RNDeviceInfo.isEmulatorSync() ? `Emulator - ${prettyName}` : prettyName,
        // Parameter names are predefined and we don't choose it here
        // eslint-disable-next-line @typescript-eslint/naming-convention
        os_version: RNDeviceInfo.getSystemVersion(),
    };
};

export default getOSAndName;
