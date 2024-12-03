import {ContactsNitroModule} from 'contacts-nitro-module';
import type {Contact} from 'contacts-nitro-module';
import {RESULTS} from 'react-native-permissions';
import type {PermissionStatus} from 'react-native-permissions';
import {requestContactPermission} from '@libs/ContactPermission';
import CONST from '@src/CONST';
import type {ContactImportResult} from './types';

function contactImport(): Promise<ContactImportResult> {
    let permissionStatus: PermissionStatus = RESULTS.UNAVAILABLE;

    return requestContactPermission()
        .then((response: PermissionStatus) => {
            permissionStatus = response;
            if (response === RESULTS.GRANTED) {
                return ContactsNitroModule.getAll([
                    CONST.DEVICE_CONTACT.FIRST_NAME,
                    CONST.DEVICE_CONTACT.LAST_NAME,
                    CONST.DEVICE_CONTACT.PHONE_NUMBERS,
                    CONST.DEVICE_CONTACT.EMAIL_ADDRESSES,
                    CONST.DEVICE_CONTACT.IMAGE_DATA,
                ]);
            }
            return [] as Contact[];
        })
        .then((deviceContacts) => ({
            contactList: Array.isArray(deviceContacts) ? deviceContacts : [],
            permissionStatus,
        }));
}

export default contactImport;
