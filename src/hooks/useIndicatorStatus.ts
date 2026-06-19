import type IndicatorStatus from '@src/types/utils/IndicatorStatus';
import useAccountIndicatorChecks from './useAccountIndicatorChecks';
import usePolicyIndicatorChecks from './usePolicyIndicatorChecks';
import useTheme from './useTheme';

type IndicatorStatusResult = {
    /** The indicator dot color: danger for errors, success for info or no issues. */
    indicatorColor: string;

    /** The indicator status. */
    status: IndicatorStatus | undefined;

    /** The policy ID associated with the indicator. */
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
