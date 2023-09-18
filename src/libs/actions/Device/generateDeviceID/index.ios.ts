import DeviceInfo from 'react-native-device-info';

const deviceID = DeviceInfo.getDeviceId();

/**
 * Get the unique ID of the current device. This should remain the same even if the user uninstalls and reinstalls the app.
 */
function generateDeviceID() {
    return DeviceInfo.getUniqueId().then((uniqueID) => `${deviceID}_${uniqueID}`);
}

export default generateDeviceID;
