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

    const {policyStatus, domainStatus, policyIDWithErrors} = usePolicyIndicatorChecks();

    const status = policyStatus ?? domainStatus;
    const indicatorColor = status ? theme.danger : theme.success;

    return {indicatorColor, status, policyIDWithErrors};
}

export default useWorkspacesTabIndicatorStatus;
