import {differenceInDays} from 'date-fns';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

function useHasTeam2025Pricing(): boolean {
    const [firstPolicyDate] = useOnyx(ONYXKEYS.NVP_PRIVATE_FIRST_POLICY_CREATED_DATE);
    const [hasManualTeam2025Pricing] = useOnyx(ONYXKEYS.NVP_PRIVATE_MANUAL_TEAM_2025_PRICING);

    if (hasManualTeam2025Pricing) {
        return true;
    }

    if (!firstPolicyDate) {
        return true;
    }

    return differenceInDays(firstPolicyDate, CONST.SUBSCRIPTION.TEAM_2025_PRICING_START_DATE) >= 0;
}

export default useHasTeam2025Pricing;
