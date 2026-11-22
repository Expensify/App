import {temporaryGetDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';

import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import useLocalize from './useLocalize';
import {useAllPersonalDetails} from './usePersonalDetails';
import useWorkspaceMembers from './useWorkspaceMembers';

/**
 * The names an expense default rule's member conditions read as, keyed by account ID.
 *
 * A rule stores account IDs, which say nothing to an admin and cannot be resolved from the policy the way a
 * category can. The workspace alone is not enough either, since a rule keeps naming a member after they are
 * removed and a rule copied to another workspace names members that workspace never had, so everyone this
 * account can see is the fallback before a row gives up and shows the stored ID.
 */
function useExpenseDefaultSubmitterNames(policy: OnyxEntry<Policy>): Record<string, string> {
    const {translate, formatPhoneNumber} = useLocalize();
    const members = useWorkspaceMembers(policy);
    const [allPersonalDetails] = useAllPersonalDetails();

    const submitters: Record<string, string> = {};
    for (const [accountID, details] of Object.entries(allPersonalDetails ?? {})) {
        // A member invited by phone is named by their SMS login, which reads as an address rather than a number
        // until it is formatted.
        const name = temporaryGetDisplayNameOrDefault({
            passedPersonalDetails: details,
            defaultValue: '',
            shouldFallbackToHidden: false,
            translate,
            formatPhoneNumber,
        });
        if (!name) {
            continue;
        }
        submitters[accountID] = name;
    }
    // The workspace's own members win, so a member reads the same here as everywhere else the workspace lists them.
    for (const {accountID, details} of members) {
        submitters[String(accountID)] = temporaryGetDisplayNameOrDefault({passedPersonalDetails: details, translate, formatPhoneNumber});
    }

    return submitters;
}

export default useExpenseDefaultSubmitterNames;
