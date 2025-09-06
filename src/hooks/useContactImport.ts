import {useCallback, useState} from 'react';
import {RESULTS} from 'react-native-permissions';
import type {PermissionStatus} from 'react-native-permissions';
import contactImport from '@libs/ContactImport';
import type {ContactImportResult} from '@libs/ContactImport/types';
import useContactPermissions from '@libs/ContactPermission/useContactPermissions';
import getContacts from '@libs/ContactUtils';
import type {OptionData} from '@libs/PersonalDetailsOptionsListUtils';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useLocalize from './useLocalize';

/**
 * Return type of the useContactImport hook.
 */
type UseContactImportResult = {
    contacts: OptionData[];
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
    const [contacts, setContacts] = useState<OptionData[]>([]);
    const {localeCompare} = useLocalize();
    const {login} = useCurrentUserPersonalDetails();

    const importAndSaveContacts = useCallback(() => {
        contactImport().then(({contactList, permissionStatus}: ContactImportResult) => {
            setContactPermissionState(permissionStatus);
            const usersFromContact = getContacts(login ?? '', contactList, localeCompare);
            setContacts(usersFromContact);
        });
    }, [localeCompare, login]);

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
