/**
 * Checks for photo storage permission on ANDROID and request for permission if not requested once.
 * returns true or false
 */

import {
    request, check, PERMISSIONS, RESULTS,
} from 'react-native-permissions';

const checkStoragePermission = () => check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE)
    .then((result) => {
        switch (result) {
            case RESULTS.UNAVAILABLE:
                break;
            case RESULTS.DENIED:
                return request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE).then((pResult) => {
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
