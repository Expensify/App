import {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import {isPolicyOwner} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

function useSubscriptionPlan() {
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [session] = useOnyx(ONYXKEYS.SESSION);

    // Filter workspaces in which user is the owner and the type is either corporate (control) or team (collect)
    const ownerPolicies = useMemo(
        () =>
            Object.values(policies ?? {}).filter(
                (policy) => isPolicyOwner(policy, session?.accountID ?? -1) && (CONST.POLICY.TYPE.CORPORATE === policy?.type || CONST.POLICY.TYPE.TEAM === policy?.type),
            ),
        [policies, session?.accountID],
    );

    if (isEmptyObject(ownerPolicies)) {
        return null;
    }

    // Check if user has corporate (control) workspace
    const hasControlWorkspace = ownerPolicies.some((policy) => policy?.type === CONST.POLICY.TYPE.CORPORATE);

    // Corporate (control) workspace is supposed to be the higher priority
    return hasControlWorkspace ? CONST.POLICY.TYPE.CORPORATE : CONST.POLICY.TYPE.TEAM;
}

export default useSubscriptionPlan;
