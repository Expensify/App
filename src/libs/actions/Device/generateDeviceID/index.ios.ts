import DeviceInfo from 'react-native-device-info';
import GenerateDeviceID from './types';

const deviceID = DeviceInfo.getDeviceId();

/**
 * Get the unique ID of the current device. This should remain the same even if the user uninstalls and reinstalls the app.
 */
const generateDeviceID: GenerateDeviceID = () => DeviceInfo.getUniqueId().then((uniqueID: string) => `${deviceID}_${uniqueID}`);

export default generateDeviceID;
