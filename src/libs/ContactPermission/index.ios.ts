import {check, PERMISSIONS, request} from 'react-native-permissions';

function requestContactPermission() {
    return request(PERMISSIONS.IOS.CONTACTS);
}

function getContactPermission() {
    return check(PERMISSIONS.IOS.CONTACTS);
}

export {requestContactPermission, getContactPermission};
