import {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import * as PolicyUtils from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

function useSubscriptionID() {
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    // Filter workspaces in which user is the admin and the type is either corporate (control) or team (collect)
    const adminPolicies = useMemo(() => Object.values(policies ?? {}).filter((policy) => PolicyUtils.isPolicyAdmin(policy) && PolicyUtils.isPaidGroupPolicy(policy)), [policies]);

    if (isEmptyObject(adminPolicies)) {
        return null;
    }

    const controlWorkspace = adminPolicies.find((policy) => policy?.type === CONST.POLICY.TYPE.CORPORATE);

    // Return a control workspace id if it exists (it's the higher priority)
    if (controlWorkspace) {
        return controlWorkspace.id;
    }

    const collectWorkspace = adminPolicies.find((policy) => policy?.type === CONST.POLICY.TYPE.TEAM);

    // Return a collect workspace id if it exists, otherwise return null
    return collectWorkspace?.id;
}

export default useSubscriptionID;
