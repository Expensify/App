import type IndicatorStatus from '@src/types/utils/IndicatorStatus';
import usePolicyIndicatorChecks from './usePolicyIndicatorChecks';
import useTheme from './useTheme';

type WorkspacesTabIndicatorStatusResult = {
    indicatorColor: string;
    status: IndicatorStatus | undefined;
    policyIDWithErrors: string | undefined;
};

function useWorkspacesTabIndicatorStatus(): WorkspacesTabIndicatorStatusResult {
    const theme = useTheme();

    const {policyErrorStatus, policyInfoStatus, domainStatus, policyIDWithErrors} = usePolicyIndicatorChecks();

    // Workspaces tab indicator priority: policy errors (red) > domain errors (red) > policy info statuses (green).
    const errorStatus = policyErrorStatus ?? domainStatus;
    const status = errorStatus ?? policyInfoStatus;
    const indicatorColor = errorStatus ? theme.danger : theme.success;

    return {indicatorColor, status, policyIDWithErrors};
}

export default useWorkspacesTabIndicatorStatus;
