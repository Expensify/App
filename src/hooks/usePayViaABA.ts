import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';

import deferModalPresentationAfterPopoverDismiss from '@libs/deferModalPresentationAfterPopoverDismiss';

import {payViaABA} from '@userActions/IOU/PayMoneyRequest';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {hasSeenTourSelector} from '@selectors/Onboarding';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useDecisionModal from './useDecisionModal';
import useDelegateAccountID from './useDelegateAccountID';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import useVerifyAccountAndResume from './useVerifyAccountAndResume';

/**
 * Returns a function that pays reports by downloading their ABA file, and tells the user when the download fails.
 * Locked accounts are shown the locked account modal instead, and unvalidated ones verify their account before it downloads.
 */
function usePayViaABA() {
    const {translate} = useLocalize();
    const {accountID} = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const {showDecisionModal} = useDecisionModal();
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isSelfTourViewed = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);
    const {isAccountLocked} = useLockedAccountState();
    const {showLockedAccountModal} = useLockedAccountActions();
    const {isUserValidated, verifyAccountAndResume} = useVerifyAccountAndResume((resume) => resume?.());

    const downloadABAFile = (reportIDs: string[], policy: OnyxEntry<Policy>, shouldReimburseHeldTransactions?: boolean) =>
        payViaABA({
            reportIDs,
            policy,
            shouldReimburseHeldTransactions,
            introSelected,
            isSelfTourViewed,
            currentUserAccountID: accountID,
            conciergeChat,
            delegateAccountID,
            userBillingGracePeriodEnds,
            amountOwed,
            ownerBillingGracePeriodEnd,
            translate,
            onDownloadFailed: () => {
                showDecisionModal({
                    title: translate('common.downloadFailedTitle'),
                    prompt: translate('common.downloadFailedDescription'),
                    secondOptionText: translate('common.buttonConfirm'),
                });
            },
        });

    // Pay via ABA is always picked from a menu, so anything blocking it is shown once that menu has closed
    return (reportIDs: string[], policy: OnyxEntry<Policy>, shouldReimburseHeldTransactions?: boolean) => {
        if (isAccountLocked) {
            deferModalPresentationAfterPopoverDismiss(showLockedAccountModal);
            return;
        }
        if (!isUserValidated) {
            deferModalPresentationAfterPopoverDismiss(() => verifyAccountAndResume(() => downloadABAFile(reportIDs, policy, shouldReimburseHeldTransactions)));
            return;
        }
        downloadABAFile(reportIDs, policy, shouldReimburseHeldTransactions);
    };
}

export default usePayViaABA;
