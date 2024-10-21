import {RESULTS} from 'react-native-permissions';
import type {PermissionStatus} from 'react-native-permissions';

function requestContactPermission(): Promise<PermissionStatus> {
    return new Promise((resolve) => {
        resolve(RESULTS.GRANTED);
    });
}

function getContactPermission(): Promise<PermissionStatus> {
    return new Promise((resolve) => {
        resolve(RESULTS.GRANTED);
    });
}

export {requestContactPermission, getContactPermission};