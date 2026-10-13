import contactImport from '@libs/ContactImport';
import type {ContactImportResult} from '@libs/ContactImport/types';
import useContactPermissions from '@libs/ContactPermission/useContactPermissions';
import {pickContacts} from '@libs/ContactPicker';
import {getContactsExtended} from '@libs/ContactUtils';
import type {SearchOption} from '@libs/OptionsListUtils';
import {expensifyLoginsSelector} from '@libs/UserUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails} from '@src/types/onyx';

import type {PermissionStatus} from 'react-native-permissions';

import {useCallback, useState} from 'react';
import {RESULTS} from 'react-native-permissions';

import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

/**
 * Return type of the useContactImport hook.
 */
type UseContactImportResult = {
    contacts: Array<SearchOption<PersonalDetails>>;
    contactPermissionState: PermissionStatus;
    importAndSaveContacts: () => void;
    pickContact: () => void;
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
    const {localeCompare, formatPhoneNumber} = useLocalize();
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [loginList] = useOnyx(ONYXKEYS.LOGINS, {selector: expensifyLoginsSelector});

    const importAndSaveContacts = useCallback(() => {
        contactImport().then(({contactList, permissionStatus}: ContactImportResult) => {
            setContactPermissionState(permissionStatus);
            const usersFromContact = getContactsExtended(contactList, localeCompare, formatPhoneNumber, countryCode, loginList);
            setContacts(usersFromContact);
        });
    }, [localeCompare, formatPhoneNumber, countryCode, loginList]);

    // Opens the system contact picker and adds the picked contacts to the list, replacing any earlier copy of the same login
    const pickContact = () => {
        pickContacts().then((deviceContacts) => {
            const pickedContacts = getContactsExtended(deviceContacts, localeCompare, formatPhoneNumber, countryCode, loginList);
            if (!pickedContacts.length) {
                return;
            }
            const pickedLogins = new Set(pickedContacts.map((contact) => contact.login));
            setContacts((previousContacts) => [...previousContacts.filter((contact) => !pickedLogins.has(contact.login)), ...pickedContacts]);
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
        pickContact,
        setContactPermissionState,
    };
}

export default useContactImport;
