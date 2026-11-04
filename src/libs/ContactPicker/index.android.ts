import type {DeviceContact} from '@libs/ContactImport/types';
import Log from '@libs/Log';

import {CONTACT_FIELDS, ContactsNitroModule} from '@expensify/nitro-utils';

// Android doesn't request READ_CONTACTS (Google Play's Contacts Permission policy), so contacts are added one at a time through the system picker
const canPickContacts = true;

function pickContacts(): Promise<DeviceContact[]> {
    return ContactsNitroModule.pick([CONTACT_FIELDS.FIRST_NAME, CONTACT_FIELDS.LAST_NAME, CONTACT_FIELDS.PHONE_NUMBERS, CONTACT_FIELDS.EMAIL_ADDRESSES])
        .then((pickedContacts) => (Array.isArray(pickedContacts) ? pickedContacts : []))
        .catch((error: unknown) => {
            Log.warn('[ContactPicker] Failed to pick a contact', {error});
            return [];
        });
}

export {canPickContacts, pickContacts};
