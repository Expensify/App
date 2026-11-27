import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {canMemberRead} from '@libs/PolicyUtils';
import type {PolicyFeature} from '@libs/PolicyUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import {emailSelector} from '@src/selectors/Session';

// eslint-disable-next-line no-restricted-imports -- The role must come from the live policy: on Search the snapshot copy can hold an outdated role.
import {useOnyx as useOnyxWithoutSnapshots} from 'react-native-onyx';

import useOnyx from './useOnyx';

/** Whether the current user's role on the workspace can read the given feature, the same check Auth runs before serving that feature's data */
function useCanReadPolicyFeature(policyID: string | undefined, feature: PolicyFeature): boolean {
    const [currentUserLogin] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const [canRead = false] = useOnyxWithoutSnapshots(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(policyID)}`, {
        selector: (policy) => canMemberRead(policy, currentUserLogin ?? '', feature),
    });
    return canRead;
}

export default useCanReadPolicyFeature;
