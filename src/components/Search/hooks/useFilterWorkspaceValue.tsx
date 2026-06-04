import type {OnyxCollection} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import type {SearchFilter} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

function useFilterWorkspaceValue(policyIDs: SearchFilter['value']): string {
    const filterWorkspaceSelector = (policies: OnyxCollection<Policy>) => {
        if (!Array.isArray(policyIDs) || !policies) {
            return null;
        }
        const workspaces = [];
        for (const policyID of policyIDs) {
            const policy = policies[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
            if (!policy) {
                continue;
            }
            workspaces.push(policy.name);
        }
        return workspaces;
    };
    const [workspaceNames] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: filterWorkspaceSelector});
    return workspaceNames?.join(', ') ?? '';
}

export default useFilterWorkspaceValue;
