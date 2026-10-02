import useContactImport from '@hooks/useContactImport';

import type {Option} from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';

import {useMemo} from 'react';
import {RESULTS} from 'react-native-permissions';

import type {ContactState, UseSearchSelectorConfig, UseSearchSelectorReturn} from './base';

import useSearchSelectorBase from './base';

/**
 * Hook that combines search functionality with selection logic for option lists.
 * Leverages heap optimization for performance with large datasets.
 * Native version includes phone contacts integration.
 *
 * @param config - Configuration object for the hook
 * @returns Object with search and selection utilities
 */
function useSearchSelector<TSelected extends Option = OptionData>(config: UseSearchSelectorConfig<TSelected>): UseSearchSelectorReturn<TSelected> {
    const {enablePhoneContacts = false} = config;

    // Phone contacts logic
    const {contacts, contactPermissionState, importAndSaveContacts, setContactPermissionState} = useContactImport();
    const memoizedContacts = useMemo(() => (contacts.length ? contacts : []), [contacts]);
    const showImportContacts = enablePhoneContacts && !(contactPermissionState === RESULTS.GRANTED || contactPermissionState === RESULTS.LIMITED);

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
