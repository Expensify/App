import {useState} from 'react';
import {RESULTS} from 'react-native-permissions';
import type {PermissionStatus} from 'react-native-permissions';
import contactImport from '@libs/ContactImport';
import type {ContactImportResult} from '@libs/ContactImport/types';
import useContactPermissions from '@libs/ContactPermission/useContactPermissions';
import {getContacts} from '@libs/ContactUtils';
import type {OptionData} from '@libs/PersonalDetailOptionsListUtils';
import {expensifyLoginsSelector} from '@libs/UserUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

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
    const {localeCompare, formatPhoneNumber} = useLocalize();
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [loginList] = useOnyx(ONYXKEYS.LOGINS, {selector: expensifyLoginsSelector});

    const importAndSaveContacts = () => {
        contactImport().then(({contactList, permissionStatus}: ContactImportResult) => {
            setContactPermissionState(permissionStatus);
            const usersFromContact = getContacts(contactList, localeCompare, formatPhoneNumber, countryCode, loginList);
            setContacts(usersFromContact);
        });
    };

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
