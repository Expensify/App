import {useOnyx} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

function useSubscriptionPlan() {
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    if (!policies) {
        return null;
    }

    const adminPolicies = Object.fromEntries(
        Object.entries(policies).filter(
            ([, policy]) => policy?.role === CONST.POLICY.ROLE.ADMIN && (CONST.POLICY.TYPE.CORPORATE === policy?.type || CONST.POLICY.TYPE.TEAM === policy?.type),
        ),
    );

    if (isEmptyObject(adminPolicies)) {
        return null;
    }

    const hasControlWorkspace = Object.entries(adminPolicies).some(([, policy]) => policy?.type === CONST.POLICY.TYPE.CORPORATE);

    return hasControlWorkspace ? CONST.POLICY.TYPE.CORPORATE : CONST.POLICY.TYPE.TEAM;
}

export default useSubscriptionPlan;
