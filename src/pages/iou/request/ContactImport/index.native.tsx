import {ContactsNitroModule} from '@modules/ContactsNitroModule/src';
import {requestContactPermission} from '@pages/iou/request/ContactPermission';
import type {ContactImportResult, DeviceContact} from './types';

function contactImport(): Promise<ContactImportResult> {
    return requestContactPermission()
        .then((response) => {
            if (response === 'granted') {
                return ContactsNitroModule.getAll(['FIRST_NAME', 'LAST_NAME', 'PHONE_NUMBERS', 'EMAIL_ADDRESSES', 'IMAGE_DATA']);
            }
            return [] as DeviceContact[];
        })
        .then((deviceContacts) => ({
            contactList: Array.isArray(deviceContacts) ? deviceContacts : [],
            isPermissionBlocked: false,
        }));
}

export default contactImport;
