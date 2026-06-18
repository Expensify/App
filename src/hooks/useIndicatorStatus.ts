import type IndicatorStatus from '@src/types/utils/IndicatorStatus';
import useAccountIndicatorChecks from './useAccountIndicatorChecks';
import usePolicyIndicatorChecks from './usePolicyIndicatorChecks';
import useTheme from './useTheme';

type IndicatorStatusResult = {
    indicatorColor: string;
    status: IndicatorStatus | undefined;
    indicatorPolicyID: string | undefined;
};

function useIndicatorStatus(): IndicatorStatusResult {
    const theme = useTheme();

    const {accountStatus, infoStatus: accountInfoStatus} = useAccountIndicatorChecks();
    const {policyErrorStatus, policyInfoStatus, domainStatus, indicatorPolicyID} = usePolicyIndicatorChecks();

    const errorStatus = accountStatus ?? policyErrorStatus ?? domainStatus;
    const status = errorStatus ?? accountInfoStatus ?? policyInfoStatus;
    const indicatorColor = errorStatus ? theme.danger : theme.success;

    return {indicatorColor, status, indicatorPolicyID};
}

export default useIndicatorStatus;
