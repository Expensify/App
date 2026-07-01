import type IndicatorStatus from '@src/types/utils/IndicatorStatus';
import usePolicyIndicatorChecks from './usePolicyIndicatorChecks';
import useTheme from './useTheme';

type WorkspacesTabIndicatorStatusResult = {
    /** The indicator dot color: danger for policy or domain errors, success for policy info or no issues. */
    indicatorColor: string;

    /** The indicator status, prioritizing policy errors, then domain errors, then policy info statuses. */
    status: IndicatorStatus | undefined;

    /** The policy ID associated with the active policy indicator. */
    indicatorPolicyID: string | undefined;
};

function useWorkspacesTabIndicatorStatus(): WorkspacesTabIndicatorStatusResult {
    const theme = useTheme();

    const {policyErrorStatus, policyInfoStatus, domainStatus, indicatorPolicyID} = usePolicyIndicatorChecks();

    // Workspaces tab indicator priority: policy errors (red) > domain errors (red) > policy info statuses (green).
    const errorStatus = policyErrorStatus ?? domainStatus;
    const status = errorStatus ?? policyInfoStatus;
    const indicatorColor = errorStatus ? theme.danger : theme.success;

    return {indicatorColor, status, indicatorPolicyID};
}

export default useWorkspacesTabIndicatorStatus;
