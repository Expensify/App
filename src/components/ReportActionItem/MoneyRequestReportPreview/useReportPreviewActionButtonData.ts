import useDelegateAccountID from '@hooks/useDelegateAccountID';
/**
 * Subscribes to the Onyx data shared by the money-request report-preview action buttons
 * (Submit / Approve / Pay) and returns it as a single object.
 */
import useOnyx from '@hooks/useOnyx';
import {usePersonalDetail} from '@hooks/usePersonalDetails';

import ONYXKEYS from '@src/ONYXKEYS';
import {loginSelector} from '@src/selectors/PersonalDetails';

import {delegateEmailSelector} from '@selectors/Account';

function useReportPreviewActionButtonData(iouReportID: string | undefined) {
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${iouReport?.policyID}`);
    const [ownerLogin] = usePersonalDetail(iouReport?.ownerAccountID, loginSelector);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const delegateAccountID = useDelegateAccountID();

    return {
        iouReport,
        policy,
        ownerLogin,
        userBillingGracePeriodEnds,
        amountOwed,
        ownerBillingGracePeriodEnd,
        delegateEmail,
        delegateAccountID,
    };
}

export default useReportPreviewActionButtonData;
