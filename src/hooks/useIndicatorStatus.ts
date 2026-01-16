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

    const {accountStatus, infoStatus, policyIDWithErrors} = useNavigationTabBarIndicatorChecks();

    const status = accountStatus ?? infoStatus;
    const indicatorColor = accountStatus ? theme.danger : theme.success;

    return {indicatorColor, status, policyIDWithErrors};
}

export default useIndicatorStatus;
