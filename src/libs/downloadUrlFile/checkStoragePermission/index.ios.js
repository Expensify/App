/**
 * Checks for photo storage permission on IOS and request for permission if not requested once.
 * returns true or false
 */

import {
    request, check, PERMISSIONS, RESULTS,
} from 'react-native-permissions';

const checkStoragePermission = () => check(PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY)
    .then((result) => {
        switch (result) {
            case RESULTS.UNAVAILABLE:
                // console.log('This feature is not available (on this device / in this context)');
                break;
            case RESULTS.DENIED:
                return request(PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY).then((pResult) => {
                    switch (pResult) {
                        case RESULTS.LIMITED:
                        case RESULTS.GRANTED:
                            return true;
                        default:
                            break;
                    }
                    return false;
                });
            case RESULTS.LIMITED:
            case RESULTS.GRANTED:
                return true;
            case RESULTS.BLOCKED:
                break;
            default:
                break;
        }
        return false;
    })
    .catch(() => false);

export default checkStoragePermission;
