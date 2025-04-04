import {differenceInDays} from 'date-fns';
import {useOnyx} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function useIsNewSubscription(): boolean {
    const [firstPolicyDate] = useOnyx(ONYXKEYS.NVP_PRIVATE_FIRST_POLICY_DATE);
    const [hasTeamPricing2025] = useOnyx(ONYXKEYS.NVP_PRIVATE_TEAM_PRICING_2025);

    if (hasTeamPricing2025) {
        return true;
    }

    if (!firstPolicyDate) {
        return false;
    }

    return differenceInDays(firstPolicyDate, CONST.SUBSCRIPTION.NEW_PRICING_START_DATE) >= 0;
}

export default useIsNewSubscription;
