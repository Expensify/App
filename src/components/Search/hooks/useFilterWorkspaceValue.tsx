import type {OnyxCollection} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import type {SearchFilter} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

function useFilterWorkspaceValues(value: SearchFilter['value']) {
    const filterWorkspaceSelector = (policies: OnyxCollection<Policy>) => {
        if (!Array.isArray(value) || !policies) {
            return null;
        }
        const workspaces = [];
        for (const policyID of value) {
            const policy = policies[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
            if (!policy) {
                continue;
            }
            workspaces.push(policy.name);
        }
        return workspaces;
    };
    const [workspaceValue] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: filterWorkspaceSelector});
    return workspaceValue;
}

export default useFilterWorkspaceValues;
