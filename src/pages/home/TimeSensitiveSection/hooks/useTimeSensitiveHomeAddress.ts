import useOnyx from '@hooks/useOnyx';

import {getEffectiveWorkArrangement} from '@libs/WorkArrangementUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PrivatePersonalDetails} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

// Only an office-based member has an ordinary commute to measure against their home, so a workspace on the
// homeAndOffice method needs an address from them and not from a member with no regular workplace. The member's
// own arrangement decides that before the workspace default does.
const createNeedsHomeAddressWorkspaceSelector = (currentUserEmail: string | undefined) => (policies: OnyxCollection<Policy>) =>
    Object.values(policies ?? {}).some(
        (policy) =>
            policy?.commuterExclusions?.method === CONST.POLICY.COMMUTER_EXCLUSION_METHOD.HOME_AND_OFFICE &&
            policy?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE &&
            getEffectiveWorkArrangement(currentUserEmail ? policy.employeeList?.[currentUserEmail]?.hasOfficeWorkArrangement : undefined, policy.commuterExclusions.isOfficeWorkArrangement),
    );

const hasHomeAddressSelector = (privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>) => (privatePersonalDetails?.addresses ?? []).some((address) => !!address?.street?.trim());

/**
 * Surfaces the "Add a home address" item under Home > Time sensitive when the user belongs to at
 * least one active workspace that measures their commute from home - the homeAndOffice
 * commuter-exclusion method, with the user office-based under it - but has no home address recorded
 * in their private personal details.
 */
function useTimeSensitiveHomeAddress() {
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [needsHomeAddressForWorkspace] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: createNeedsHomeAddressWorkspaceSelector(session?.email)});
    const [hasHomeAddress] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {selector: hasHomeAddressSelector});

    return {
        shouldShowAddHomeAddress: !!needsHomeAddressForWorkspace && !hasHomeAddress,
    };
}

export default useTimeSensitiveHomeAddress;
