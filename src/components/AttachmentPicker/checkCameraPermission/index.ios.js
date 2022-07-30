import {PERMISSIONS, request, RESULTS} from 'react-native-permissions';

export default function checkCameraPermission() {
    /**
    * Checks to see if the iOS device has camera permission or not
    */
    request(PERMISSIONS.IOS.CAMERA).then(result => result === RESULTS.GRANTED);
}
