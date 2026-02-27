import {check, PERMISSIONS, request} from 'react-native-permissions';

function requestContactPermission() {
    return request(PERMISSIONS.ANDROID.READ_CONTACTS);
}

function getContactPermission() {
    return check(PERMISSIONS.ANDROID.READ_CONTACTS);
}

export {requestContactPermission, getContactPermission};
