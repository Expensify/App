import {ContactsNitroModule} from 'contacts-nitro-module';
import {requestContactPermission} from '@pages/iou/request/ContactPermission';
import CONST from '@src/CONST';
import type {ContactImportResult, DeviceContact} from './types';

function contactImport(): Promise<ContactImportResult> {
    let isPermissionGranted = false;
    return requestContactPermission()
        .then((response) => {
            if (response === 'granted') {
                isPermissionGranted = true;
                return ContactsNitroModule.getAll([
                    CONST.DEVICE_CONTACT.FIRST_NAME,
                    CONST.DEVICE_CONTACT.LAST_NAME,
                    CONST.DEVICE_CONTACT.PHONE_NUMBERS,
                    CONST.DEVICE_CONTACT.EMAIL_ADDRESSES,
                    CONST.DEVICE_CONTACT.IMAGE_DATA,
                ]);
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
