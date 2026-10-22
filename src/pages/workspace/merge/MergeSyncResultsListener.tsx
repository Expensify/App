import useMergeSyncResultsPage from '@hooks/useMergeSyncResultsPage';

import type {HRConnectionName} from '@libs/merge/HRUtils';
import type {RecruitingConnectionName} from '@libs/merge/RecruitingUtils';

type MergeSyncResultsListenerProps = {
    /** The workspace the connected provider belongs to. */
    policyID: string;

    /** The HR or recruiting provider that is currently connected to the workspace. */
    connectionName: HRConnectionName | RecruitingConnectionName;
};

function MergeSyncResultsListener({policyID, connectionName}: MergeSyncResultsListenerProps) {
    useMergeSyncResultsPage(policyID, connectionName);

    return null;
}

export default MergeSyncResultsListener;
