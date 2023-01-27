import DeviceInfo from 'react-native-device-info';
import Str from 'expensify-common';

const deviceID = DeviceInfo.getDeviceId();
const uniqueID = Str.guid(deviceID);

/**
 * Get the "unique ID of the device". Note that the hardware ID provided by react-native-device-info for Android is considered private information,
 * so using it without appropriate permissions would cause our app to be unlisted from the Google Play Store:
 *
 *     - https://developer.android.com/training/articles/user-data-ids#kotlin
 *     = https://support.google.com/googleplay/android-developer/answer/10144311
 *
 * Therefore, this deviceID is not truly unique but will be a new GUID each time the app runs.
 *
 * This GUID should stored in Onyx under ONYXKEYS.DEVICE_ID and preserved on logout, such that the deviceID will only change if:
 *
 * - The user uninstalls and reinstalls the app (Android/desktop)
 * - The user opens the app on a different browser or in an incognito window (web)
 * - The user manually clears Onyx data
 *
 * While this isn't perfect, it's the best we can do without violating Google Play's App Store guidelines.
 * It's also just as good as any common web solution, such as this one (which is also reset under the same circumstances):
 * https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo/deviceId
 *
 * @returns {Promise<String>}
 */
function generateDeviceID() {
    return Promise.resolve(uniqueID);
}

export default generateDeviceID;
