import type {DeviceContact} from '@libs/ContactImport/types';

// Other platforms import device contacts in bulk (see ContactImport) instead of picking them one at a time
const canPickContacts = false;

function pickContacts(): Promise<DeviceContact[]> {
    return Promise.resolve([]);
}

export {canPickContacts, pickContacts};
