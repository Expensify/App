import {useOnyx} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

function useSubscriptionPlan() {
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    if (!policies) {
        return null;
    }

    // Filter workspaces in which user is the admin and the type is either corporate (control) or team (collect)
    const adminPolicies = Object.fromEntries(
        Object.entries(policies).filter(
            ([, policy]) => policy?.role === CONST.POLICY.ROLE.ADMIN && (CONST.POLICY.TYPE.CORPORATE === policy?.type || CONST.POLICY.TYPE.TEAM === policy?.type),
        ),
    );

    if (isEmptyObject(adminPolicies)) {
        return null;
    }

    // Check if user has corporate (control) workspace
    const hasControlWorkspace = Object.entries(adminPolicies).some(([, policy]) => policy?.type === CONST.POLICY.TYPE.CORPORATE);

    // Corporate (control) workspace is supposed to be the higher priority
    return hasControlWorkspace ? CONST.POLICY.TYPE.CORPORATE : CONST.POLICY.TYPE.TEAM;
}

export default useSubscriptionPlan;
