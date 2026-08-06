import {getContactPermission} from '@libs/ContactPermission';

import type {Contact} from '@expensify/nitro-utils';
import type {PermissionStatus} from 'react-native-permissions';

import {CONTACT_FIELDS, ContactsNitroModule} from '@expensify/nitro-utils';
import {RESULTS} from 'react-native-permissions';

import type {ContactImportResult} from './types';

// Holds the in-flight import so concurrent callers reuse a single native scan of the address book.
let pendingContactImport: Promise<ContactImportResult> | null = null;

function contactImport(): Promise<ContactImportResult> {
    // Returning from device Settings after granting Contacts access fires both the AppState "active"
    // listener and useFocusEffect, and the participant screen mounts the import hook more than once, so a
    // single foreground event can trigger several imports at the same moment. Loading the whole address book
    // (including image data) multiple times concurrently causes an out-of-memory crash on iOS, so while an
    // import is already running we hand every caller the same promise instead of starting another scan.
    // See https://github.com/Expensify/App/issues/97939
    if (pendingContactImport) {
        return pendingContactImport;
    }

    let permissionStatus: PermissionStatus = RESULTS.UNAVAILABLE;

    pendingContactImport = getContactPermission()
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
        })
        .finally(() => {
            // Clear the cache once the scan settles so future foregrounds re-read the address book.
            pendingContactImport = null;
        });

    return pendingContactImport;
}

export default contactImport;
