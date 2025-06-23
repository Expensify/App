import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

function useWorkspaceAccountID(policyID: string | undefined) {
    const [workspaceAccountID = CONST.DEFAULT_NUMBER_ID] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {selector: (policy) => policy?.workspaceAccountID});

    return workspaceAccountID;
}

export default useWorkspaceAccountID;
