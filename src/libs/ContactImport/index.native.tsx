import {CONTACT_FIELDS, ContactsNitroModule} from '@expensify/nitro-utils';
import type {Contact} from '@expensify/nitro-utils';
import {RESULTS} from 'react-native-permissions';
import type {PermissionStatus} from 'react-native-permissions';
import {getContactPermission} from '@libs/ContactPermission';
import type {ContactImportResult} from './types';

function contactImport(): Promise<ContactImportResult> {
    let permissionStatus: PermissionStatus = RESULTS.UNAVAILABLE;

    return getContactPermission()
        .then((response: PermissionStatus) => {
            permissionStatus = response;
            if (response !== RESULTS.GRANTED && response !== RESULTS.LIMITED) {
                return [] as Contact[];
            }

            return ContactsNitroModule.getAll([CONTACT_FIELDS.FIRST_NAME, CONTACT_FIELDS.LAST_NAME, CONTACT_FIELDS.PHONE_NUMBERS, CONTACT_FIELDS.EMAIL_ADDRESSES, CONTACT_FIELDS.IMAGE_DATA]);
        })
        .then((deviceContacts) => ({
            contactList: Array.isArray(deviceContacts) ? deviceContacts : [],
            permissionStatus,
        }))
        .catch((error) => {
            console.error('Error importing contacts:', error);
            return {
                contactList: [],
                permissionStatus,
            };
        });
}

export default contactImport;
