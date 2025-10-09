import {useCallback, useMemo} from 'react';
import {InteractionManager} from 'react-native';
import {RESULTS} from 'react-native-permissions';
import useContactImport from './useContactImport';
import type {ContactState, UseSearchSelectorConfig, UseSearchSelectorReturn} from './useSearchSelector.base';
import useSearchSelectorBase from './useSearchSelector.base';

/**
 * Hook that combines search functionality with selection logic for option lists.
 * Leverages heap optimization for performance with large datasets.
 * Native version includes phone contacts integration.
 *
 * @param config - Configuration object for the hook
 * @returns Object with search and selection utilities
 */
function useSearchSelector(config: UseSearchSelectorConfig): UseSearchSelectorReturn {
    const {enablePhoneContacts = false} = config;

    // Phone contacts logic
    const {contacts, contactPermissionState, importAndSaveContacts, setContactPermissionState} = useContactImport();
    const memoizedContacts = useMemo(() => (contacts.length ? contacts : []), [contacts]);
    const showImportContacts = enablePhoneContacts && !(contactPermissionState === RESULTS.GRANTED || contactPermissionState === RESULTS.LIMITED);

    const initiateContactImportAndSetState = useCallback(() => {
        setContactPermissionState(RESULTS.GRANTED);
        // eslint-disable-next-line deprecation/deprecation
        InteractionManager.runAfterInteractions(importAndSaveContacts);
    }, [importAndSaveContacts, setContactPermissionState]);

    // Use base hook with contact options
    const baseResult = useSearchSelectorBase({
        ...config,
        contactOptions: enablePhoneContacts ? memoizedContacts : undefined,
    });

    // Build contact state if enabled
    const contactState: ContactState | undefined = enablePhoneContacts
        ? {
              permissionStatus: contactPermissionState,
              contactOptions: contacts,
              showImportUI: showImportContacts,
              importContacts: importAndSaveContacts,
              initiateContactImportAndSetState,
              setContactPermissionState,
          }
        : undefined;

    return {
        ...baseResult,
        contactState,
    };
}

export default useSearchSelector;
export type {ContactState};
