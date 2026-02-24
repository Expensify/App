import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import useNavigationTabBarIndicatorChecks from './useNavigationTabBarIndicatorChecks';
import useTheme from './useTheme';

type IndicatorStatusResult = {
    indicatorColor: string;
    status: ValueOf<typeof CONST.INDICATOR_STATUS> | undefined;
    policyIDWithErrors: string | undefined;
};

function useIndicatorStatus(): IndicatorStatusResult {
    const theme = useTheme();

    const {accountStatus, infoStatus, policyStatus, domainStatus, policyIDWithErrors} = useNavigationTabBarIndicatorChecks();

    const errorStatus = accountStatus ?? policyStatus ?? domainStatus;
    const status = errorStatus ?? infoStatus;
    const indicatorColor = errorStatus ? theme.danger : theme.success;

    return {indicatorColor, status, policyIDWithErrors};
}

export default useIndicatorStatus;
