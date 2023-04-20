import {
    getDeviceId, getSystemVersion,
} from 'react-native-device-info';

export default function getOSAndName() {
    return {
        device_name: getDeviceId(),
        os_version: getSystemVersion(),
    };
}
