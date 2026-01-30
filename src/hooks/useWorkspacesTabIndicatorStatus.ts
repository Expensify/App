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

    const {policyStatus, policyIDWithErrors} = useNavigationTabBarIndicatorChecks();

    const status = policyStatus;
    const indicatorColor = policyStatus ? theme.danger : theme.success;

    return {indicatorColor, status, policyIDWithErrors};
}

export default useWorkspacesTabIndicatorStatus;
