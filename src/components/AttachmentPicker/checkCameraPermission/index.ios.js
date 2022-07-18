import {PERMISSIONS, request, RESULTS} from 'react-native-permissions';

export default async function checkCameraPermission() {
  /**
   * Checks to see if the iOS device has camera permission or not
   */
   const result = await request(PERMISSIONS.IOS.CAMERA);
    if (result === RESULTS.GRANTED) {
        return true;
    } else if (result === RESULTS.BLOCKED) {
        return false;
    }
};
