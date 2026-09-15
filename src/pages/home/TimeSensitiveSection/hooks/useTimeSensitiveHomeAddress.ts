import useOnyx from '@hooks/useOnyx';

import ONYXKEYS from '@src/ONYXKEYS';
import type {PrivatePersonalDetails} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {hasHomeAndOfficeCommuterExclusionPolicySelector} from '@selectors/Policy';

const hasHomeAddressSelector = (privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>) => (privatePersonalDetails?.addresses ?? []).some((address) => !!address?.street?.trim());

/**
 * Surfaces the "Add a home address" item under Home > Time sensitive when the user belongs to at
 * least one active workspace that has the homeAndOffice commuter-exclusion method enabled but has
 * no home address recorded in their private personal details.
 */
function useTimeSensitiveHomeAddress() {
    const [hasHomeAndOfficeWorkspace] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: hasHomeAndOfficeCommuterExclusionPolicySelector});
    const [hasHomeAddress] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {selector: hasHomeAddressSelector});

    return {
        shouldShowAddHomeAddress: !!hasHomeAndOfficeWorkspace && !hasHomeAddress,
    };
}

export default useTimeSensitiveHomeAddress;
