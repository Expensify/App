import useNavigationTabBarIndicatorChecks from './useNavigationTabBarIndicatorChecks';
import type {IndicatorStatus} from './useNavigationTabBarIndicatorChecks';
import useTheme from './useTheme';

type AccountTabIndicatorStatusResult = {
    indicatorColor: string;
    status: IndicatorStatus | undefined;
};

function useAccountTabIndicatorStatus(): AccountTabIndicatorStatusResult {
    const theme = useTheme();

    const {accountStatus, infoStatus} = useNavigationTabBarIndicatorChecks();

    const status = accountStatus ?? infoStatus;
    const indicatorColor = accountStatus ? theme.danger : theme.success;

    return {indicatorColor, status};
}

export default useAccountTabIndicatorStatus;
