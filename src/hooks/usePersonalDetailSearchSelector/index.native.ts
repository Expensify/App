import {RESULTS} from 'react-native-permissions';
import useContactImport from '@hooks/useContactImportNew';
import type {ContactState, UseSearchSelectorConfig, UseSearchSelectorReturn} from './base';
import usePersonalDetailSearchSelectorBase from './base';

/**
 * Hook that combines search functionality with selection logic for option lists.
 * Leverages heap optimization for performance with large datasets.
 * Native version includes phone contacts integration.
 *
 * @param config - Configuration object for the hook
 * @returns Object with search and selection utilities
 */
function usePersonalDetailSearchSelector(config: UseSearchSelectorConfig): UseSearchSelectorReturn {
    const {enablePhoneContacts = false} = config;

    // Phone contacts logic
    const {contacts, contactPermissionState, importAndSaveContacts, setContactPermissionState} = useContactImport();
    const showImportContacts = enablePhoneContacts && !(contactPermissionState === RESULTS.GRANTED || contactPermissionState === RESULTS.LIMITED);

    // Use base hook with contact options
    const baseResult = usePersonalDetailSearchSelectorBase({
        ...config,
        contactOptions: enablePhoneContacts ? contacts : undefined,
    });

    // Build contact state if enabled
    const contactState: ContactState | undefined = enablePhoneContacts
        ? {
              permissionStatus: contactPermissionState,
              showImportUI: showImportContacts,
              importContacts: importAndSaveContacts,
              setContactPermissionState,
          }
        : undefined;

    return {
        ...baseResult,
        contactState,
    };
}

export default usePersonalDetailSearchSelector;
export type {ContactState};
