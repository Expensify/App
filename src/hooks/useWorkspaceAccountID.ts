import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import useOnyx from './useOnyx';

const policyWorkspaceAccountIDSelector = (policy: OnyxEntry<Policy>) => policy?.workspaceAccountID;

function useWorkspaceAccountID(policyID: string | undefined) {
    const [workspaceAccountID = CONST.DEFAULT_NUMBER_ID] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {selector: policyWorkspaceAccountIDSelector, canBeMissing: true});

    return workspaceAccountID;
}

export default useWorkspaceAccountID;
