import {useCallback, useState} from 'react';
import {RESULTS} from 'react-native-permissions';
import type {PermissionStatus} from 'react-native-permissions';
import contactImport from '@libs/ContactImport';
import type {ContactImportResult} from '@libs/ContactImport/types';
import useContactPermissions from '@libs/ContactPermission/useContactPermissions';
import getContacts from '@libs/ContactUtils';
import type {SearchOption} from '@libs/OptionsListUtils';
import type {PersonalDetails} from '@src/types/onyx';
import useLocalize from './useLocalize';

/**
 * Return type of the useContactImport hook.
 */
type UseContactImportResult = {
    contacts: Array<SearchOption<PersonalDetails>>;
    contactPermissionState: PermissionStatus;
    importAndSaveContacts: () => void;
    setContactPermissionState: React.Dispatch<React.SetStateAction<PermissionStatus>>;
};

/**
 * Custom hook that handles importing device contacts,
 * managing permissions, and transforming contact data
 * into a format suitable for use in the app.
 */
function useContactImport(): UseContactImportResult {
    const [contactPermissionState, setContactPermissionState] = useState<PermissionStatus>(RESULTS.UNAVAILABLE);
    const [contacts, setContacts] = useState<Array<SearchOption<PersonalDetails>>>([]);
    const {localeCompare} = useLocalize();

    const importAndSaveContacts = useCallback(() => {
        contactImport().then(({contactList, permissionStatus}: ContactImportResult) => {
            setContactPermissionState(permissionStatus);
            const usersFromContact = getContacts(contactList, localeCompare);
            setContacts(usersFromContact);
        });
    }, [localeCompare]);

    useContactPermissions({
        importAndSaveContacts,
        setContacts,
        contactPermissionState,
        setContactPermissionState,
    });

    return {
        contacts,
        contactPermissionState,
        importAndSaveContacts,
        setContactPermissionState,
    };
}

export default useContactImport;
