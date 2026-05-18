import {RESULTS} from 'react-native-permissions';
import type {ContactImportResult} from './types';

const contactImport = (): Promise<ContactImportResult> => {
    return Promise.resolve({
        contactList: [],
        permissionStatus: RESULTS.UNAVAILABLE,
    });
};

export default contactImport;
