import {RESULTS} from 'react-native-permissions';

import type {ContactImportResult} from './types';

// Android can't read the whole address book because READ_CONTACTS isn't declared. Contacts are picked one at a time with ContactPicker instead.
const contactImport = (): Promise<ContactImportResult> => {
    return Promise.resolve({
        contactList: [],
        permissionStatus: RESULTS.UNAVAILABLE,
    });
};

export default contactImport;
