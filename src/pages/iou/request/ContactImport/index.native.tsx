import {ContactsNitroModule} from 'contacts-nitro-module';
import {requestContactPermission} from '@pages/iou/request/ContactPermission';
import type {ContactImportResult, DeviceContact} from './types';

function contactImport(): Promise<ContactImportResult> {
    let isPermissionGranted = false;
    return requestContactPermission()
        .then((response) => {
            if (response === 'granted') {
                isPermissionGranted = true;
                return ContactsNitroModule.getAll(['FIRST_NAME', 'LAST_NAME', 'PHONE_NUMBERS', 'EMAIL_ADDRESSES', 'IMAGE_DATA']);
            }
            isPermissionGranted = false;
            return [] as DeviceContact[];
        })
        .then((deviceContacts) => ({
            contactList: Array.isArray(deviceContacts) ? deviceContacts : [],
            isPermissionBlocked: !isPermissionGranted,
        }));
}

export default contactImport;
