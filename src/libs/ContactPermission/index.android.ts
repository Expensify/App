import type {PermissionStatus} from 'react-native-permissions';

import {RESULTS} from 'react-native-permissions';

// READ_CONTACTS isn't declared on Android (Google Play's Contacts Permission policy). Contacts are picked with the system picker, which needs no permission.
function requestContactPermission(): Promise<PermissionStatus> {
    return Promise.resolve(RESULTS.UNAVAILABLE);
}

function getContactPermission(): Promise<PermissionStatus> {
    return Promise.resolve(RESULTS.UNAVAILABLE);
}

export {requestContactPermission, getContactPermission};
