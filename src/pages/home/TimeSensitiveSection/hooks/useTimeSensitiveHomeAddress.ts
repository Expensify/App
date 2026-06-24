import useOnyx from '@hooks/useOnyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Surfaces the "Add a home address" item under Home > Time sensitive when the user belongs to at
 * least one active workspace that has the homeAndOffice commuter-exclusion method enabled but has
 * no home address recorded in their private personal details.
 *
 * Subscribes to the raw COLLECTION.POLICY (no selector) so every nested change to any policy
 * - including switching method to fixedDistance or removing commuterExclusions entirely - is
 * picked up reliably. Matches the pattern of the other useTimeSensitive* hooks in this folder.
 */
function useTimeSensitiveHomeAddress() {
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);

    const hasHomeAndOfficeWorkspace = Object.values(allPolicies ?? {}).some(
        (policy) => policy?.commuterExclusions?.method === CONST.POLICY.COMMUTER_EXCLUSION_METHOD.HOME_AND_OFFICE && policy?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
    );

    const hasHomeAddress = (privatePersonalDetails?.addresses ?? []).some((address) => !!address?.street?.trim());

    return {
        shouldShowAddHomeAddress: hasHomeAndOfficeWorkspace && !hasHomeAddress,
    };
}

export default useTimeSensitiveHomeAddress;
