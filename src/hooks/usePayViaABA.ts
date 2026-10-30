import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';

import deferModalPresentationAfterPopoverDismiss from '@libs/deferModalPresentationAfterPopoverDismiss';
import type HttpsError from '@libs/Errors/HttpsError';
import {getDisplayNameForParticipant, getReportOrDraftReport} from '@libs/ReportUtils';

import {payViaABA} from '@userActions/IOU/PayMoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {hasSeenTourSelector} from '@selectors/Onboarding';
import {useState} from 'react';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useDecisionModal from './useDecisionModal';
import useDelegateAccountID from './useDelegateAccountID';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import useVerifyAccountAndResume from './useVerifyAccountAndResume';

/**
 * Returns a function that pays reports by downloading their ABA file, and tells the user when the download fails.
 * Locked accounts are shown the locked account modal instead, and unvalidated ones verify their account before it downloads.
 * Also returns whether a download is in progress, so the Pay button can show it's loading.
 */
function usePayViaABA() {
    const {translate, formatPhoneNumber} = useLocalize();
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
    const [isDownloadingABAFile, setIsDownloadingABAFile] = useState(false);

    const getDownloadFailedPrompt = (reportIDs: string[], error?: HttpsError) => {
        if (!error?.message.includes(CONST.ERROR.MISSING_ABA_DEPOSIT_ACCOUNT)) {
            return translate('common.downloadFailedDescription');
        }

        // We can say who's missing a bank account for single reports only
        const report = reportIDs.length === 1 ? getReportOrDraftReport(reportIDs.at(0)) : undefined;
        const name = getDisplayNameForParticipant({accountID: report?.ownerAccountID, shouldFallbackToHidden: false, formatPhoneNumber});
        return name ? translate('iou.missingABADepositAccount', {name}) : translate('iou.employeesMissingABADepositAccount');
    };

    const downloadABAFile = (reportIDs: string[], policy: OnyxEntry<Policy>, shouldReimburseHeldTransactions?: boolean) => {
        setIsDownloadingABAFile(true);
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
            onDownloadFailed: (error) => {
                showDecisionModal({
                    title: translate('common.downloadFailedTitle'),
                    prompt: getDownloadFailedPrompt(reportIDs, error),
                    secondOptionText: translate('common.buttonConfirm'),
                });
            },
        }).finally(() => setIsDownloadingABAFile(false));
    };

    // Pay via ABA is always picked from a menu, so anything blocking it is shown once that menu has closed
    const payReportsViaABA = (reportIDs: string[], policy: OnyxEntry<Policy>, shouldReimburseHeldTransactions?: boolean) => {
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

    return {payReportsViaABA, isDownloadingABAFile};
}

export default usePayViaABA;
