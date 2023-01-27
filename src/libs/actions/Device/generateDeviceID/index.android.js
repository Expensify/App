import DeviceInfo from 'react-native-device-info';
import Str from 'expensify-common';

const deviceID = DeviceInfo.getDeviceId();
const uniqueID = Str.guid(deviceID);

/**
 * Get the "unique ID of the device". Note that the hardware ID provided by react-native-device-info for Android is considered private information,
 * so using it without appropriate permissions could cause our app to be unlisted from the Google Play Store:
 *
 *   - https://developer.android.com/training/articles/user-data-ids#kotlin
 *   = https://support.google.com/googleplay/android-developer/answer/10144311
 *
 * Therefore, this deviceID is not truly unique, but will be a new GUID each time the app runs (we work around this limitation by saving it in Onyx).
 *
 * This GUID is stored in Onyx under ONYXKEYS.DEVICE_ID and is preserved on logout, such that the deviceID will only change if:
 *
 *   - The user uninstalls and reinstalls the app (Android), OR
 *   - The user manually clears Onyx data
 *
 * While this isn't perfect, it's the best we can do without violating the Google Play Store guidelines, and it's probably good enough for most real-world users.
 * Furthermore, the deviceID prefix is not unique to a specific device, but is likely to change from one type of device to another.
 *
 * Including this prefix will tell us with a reasonable degree of confidence if the user just uninstalled and reinstalled the app, or if they got a new device.
 *
 * @returns {Promise<String>}
 */
function generateDeviceID() {
    return Promise.resolve(uniqueID);
}

export default generateDeviceID;
