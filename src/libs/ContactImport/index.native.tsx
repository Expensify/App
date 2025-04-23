import {ContactsNitroModule} from '@expensify/nitro-utils';
import type {Contact} from '@expensify/nitro-utils';
import {CONTACT_FIELDS} from '@expensify/nitro-utils/src/specs/ContactsModule.nitro';
import {RESULTS} from 'react-native-permissions';
import type {PermissionStatus} from 'react-native-permissions';
import {requestContactPermission} from '@libs/ContactPermission';
import type {ContactImportResult} from './types';

function contactImport(): Promise<ContactImportResult> {
    let permissionStatus: PermissionStatus = RESULTS.UNAVAILABLE;

    return requestContactPermission()
        .then((response: PermissionStatus) => {
            permissionStatus = response;
            if (response !== RESULTS.GRANTED) {
                return [] as Contact[];
            }

            return ContactsNitroModule.getAll([CONTACT_FIELDS.FIRST_NAME, CONTACT_FIELDS.LAST_NAME, CONTACT_FIELDS.PHONE_NUMBERS, CONTACT_FIELDS.EMAIL_ADDRESSES, CONTACT_FIELDS.IMAGE_DATA]);
        })
        .then((deviceContacts) => ({
            contactList: Array.isArray(deviceContacts) ? deviceContacts : [],
            permissionStatus,
        }));
}

export default contactImport;
