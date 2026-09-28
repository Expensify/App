import useOnyx from '@hooks/useOnyx';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PrivatePersonalDetails} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

const hasHomeAndOfficeWorkspaceSelector = (policies: OnyxCollection<Policy>) =>
    Object.values(policies ?? {}).some(
        (policy) => policy?.commuterExclusions?.method === CONST.POLICY.COMMUTER_EXCLUSION_METHOD.HOME_AND_OFFICE && policy?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
    );

const hasHomeAddressSelector = (privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>) => (privatePersonalDetails?.addresses ?? []).some((address) => !!address?.street?.trim());

/**
 * Surfaces the "Add a home address" item under Home > Time sensitive when the user belongs to at
 * least one active workspace that has the homeAndOffice commuter-exclusion method enabled but has
 * no home address recorded in their private personal details.
 */
function useTimeSensitiveHomeAddress() {
    const [hasHomeAndOfficeWorkspace] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: hasHomeAndOfficeWorkspaceSelector});
    const [hasHomeAddress] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {selector: hasHomeAddressSelector});

    return {
        shouldShowAddHomeAddress: !!hasHomeAndOfficeWorkspace && !hasHomeAddress,
    };
}

export default useTimeSensitiveHomeAddress;
