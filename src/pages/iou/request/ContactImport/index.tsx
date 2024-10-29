import type {ContactImportResult} from './types';

const contactImport = (): Promise<ContactImportResult> => {
    return Promise.resolve({
        contactList: [],
        isPermissionBlocked: false,
    });
};

export default contactImport;
