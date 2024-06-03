import {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import * as PolicyUtils from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

function useSubscriptionPlan() {
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    // Filter workspaces in which user is the admin and the type is either corporate (control) or team (collect)
    const adminPolicies = useMemo(() => Object.values(policies ?? {}).filter((policy) => PolicyUtils.isPolicyAdmin(policy) && PolicyUtils.isPaidGroupPolicy(policy)), [policies]);

    if (isEmptyObject(adminPolicies)) {
        return null;
    }

    // Check if user has corporate (control) workspace
    const hasControlWorkspace = adminPolicies.some((policy) => policy?.type === CONST.POLICY.TYPE.CORPORATE);

    // Corporate (control) workspace is supposed to be the higher priority
    return hasControlWorkspace ? CONST.POLICY.TYPE.CORPORATE : CONST.POLICY.TYPE.TEAM;
}

export default useSubscriptionPlan;
