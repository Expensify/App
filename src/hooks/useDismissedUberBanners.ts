import {setNameValuePair} from '@userActions/User';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

function useDismissedUberBanners({policyID}: {policyID?: string}): {isDismissed: boolean; setAsDismissed: () => void} {
    const [dismissedUberBanners, metadata] = useOnyx(ONYXKEYS.NVP_DISMISSED_UBER_BANNERS, {canBeMissing: true});
    const isDismissed = (!!policyID && !!dismissedUberBanners) || metadata.status !== 'loaded';

    const setAsDismissed = () => {
        if (!policyID) {
            return;
        }
        setNameValuePair(ONYXKEYS.NVP_DISMISSED_UBER_BANNERS, !isDismissed, isDismissed);
    };

    return {isDismissed, setAsDismissed};
}

export default useDismissedUberBanners;
