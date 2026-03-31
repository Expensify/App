import type IndicatorStatus from '@src/types/utils/IndicatorStatus';
import useAccountIndicatorChecks from './useAccountIndicatorChecks';
import useTheme from './useTheme';

type AccountTabIndicatorStatusResult = {
    indicatorColor: string;
    status: IndicatorStatus | undefined;
};

function useAccountTabIndicatorStatus(): AccountTabIndicatorStatusResult {
    const theme = useTheme();

    const {accountStatus, infoStatus} = useAccountIndicatorChecks();

    const status = accountStatus ?? infoStatus;
    const indicatorColor = accountStatus ? theme.danger : theme.success;

    return {indicatorColor, status};
}

export default useAccountTabIndicatorStatus;
