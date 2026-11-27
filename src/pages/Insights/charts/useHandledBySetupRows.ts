/** Reads the workspace the Handled by setup rows change and works out which of them to offer, so the chart widget and the table agree on them. */
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import usePolicy from '@hooks/usePolicy';

import type {InsightsHandledByStage} from '@pages/Insights/dashboardSpecs';

import type {HandledBySetupRow} from './getHandledBySetupRows';

import getHandledBySetupRows from './getHandledBySetupRows';

type HandledBySetupRows = {
    setupRows: HandledBySetupRow[];

    /** The workspace the rows change, set only when the Workspace filter picks exactly one */
    setupPolicyID: string | undefined;
};

/** Returns the setup rows for the given stage, none for a chart without one */
function useHandledBySetupRows(policyIDs: string[], stage: InsightsHandledByStage | undefined): HandledBySetupRows {
    const {login} = useCurrentUserPersonalDetails();
    // Setup rows change one workspace, so only the workspace picked alone is read
    const setupPolicyID = stage && policyIDs.length === 1 ? policyIDs.at(0) : undefined;
    const setupPolicy = usePolicy(setupPolicyID);
    const setupRows = stage ? getHandledBySetupRows({policyIDs, policy: setupPolicy, login, stage}) : [];
    return {setupRows, setupPolicyID};
}

export default useHandledBySetupRows;
