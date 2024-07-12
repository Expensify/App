import {useOnyx} from 'react-native-onyx';
import * as User from '@userActions/User';
import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type UseDismissedReferralBannersProps = {
    referralContentType:
        | typeof CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE
        | typeof CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT
        | typeof CONST.REFERRAL_PROGRAM.CONTENT_TYPES.PAY_SOMEONE
        | typeof CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND;
};

function useDismissedReferralBanners({referralContentType}: UseDismissedReferralBannersProps): {isDismissed: boolean; setAsDismissed: () => void} {
    const [dismissedReferralBanners] = useOnyx(ONYXKEYS.NVP_DISMISSED_REFERRAL_BANNERS);
    const isDismissed = dismissedReferralBanners?.[referralContentType] ?? false;

    const setAsDismissed = () => {
        if (!referralContentType) {
            return;
        }
        // Set the banner as dismissed
        User.dismissReferralBanner(referralContentType);
    };

    return {isDismissed, setAsDismissed};
}

export default useDismissedReferralBanners;
