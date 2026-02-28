import useNavigationTabBarIndicatorChecks from './useNavigationTabBarIndicatorChecks';
import type {IndicatorStatus} from './useNavigationTabBarIndicatorChecks';
import useTheme from './useTheme';

type WorkspacesTabIndicatorStatusResult = {
    indicatorColor: string;
    status: IndicatorStatus | undefined;
    policyIDWithErrors: string | undefined;
};

function useWorkspacesTabIndicatorStatus(): WorkspacesTabIndicatorStatusResult {
    const theme = useTheme();

    const {policyStatus, domainStatus, policyIDWithErrors} = useNavigationTabBarIndicatorChecks();

    const status = policyStatus ?? domainStatus;
    const indicatorColor = status ? theme.danger : theme.success;

    return {indicatorColor, status, policyIDWithErrors};
}

export default useWorkspacesTabIndicatorStatus;
