import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';
import {ModalActions, useModal} from '@components/Modal/Global/ModalContext';
import PayViaABADownloadModal from '@components/PayViaABADownloadModal';

import deferModalPresentationAfterPopoverDismiss from '@libs/deferModalPresentationAfterPopoverDismiss';
import type HttpsError from '@libs/Errors/HttpsError';
import Log from '@libs/Log';
import {getDisplayNameForParticipant} from '@libs/ReportUtils';
import saveTextFile from '@libs/saveTextFile';

import {payViaABA} from '@userActions/IOU/PayMoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {hasSeenTourSelector} from '@selectors/Onboarding';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useDelegateAccountID from './useDelegateAccountID';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import useVerifyAccountAndResume from './useVerifyAccountAndResume';

type ReportToPayViaABA = Pick<Report, 'reportID' | 'ownerAccountID'>;

type PayReportsViaABAOptions = {
    shouldReimburseHeldTransactions?: boolean;
    onPaid?: () => void;
};

/**
 * Returns a function that pays reports by downloading their ABA file, showing its progress in a download modal.
 * Locked accounts are shown the locked account modal instead, and unvalidated ones verify their account before it downloads.
 */
function usePayViaABA() {
    const {translate, formatPhoneNumber} = useLocalize();
    const {accountID} = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const modal = useModal();
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isSelfTourViewed = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);
    const {isAccountLocked} = useLockedAccountState();
    const {showLockedAccountModal} = useLockedAccountActions();
    const {isUserValidated, verifyAccountAndResume} = useVerifyAccountAndResume((resume?: () => void) => resume?.());

    const getDownloadFailedPrompt = (reports: ReportToPayViaABA[], error?: HttpsError) => {
        if (!error?.message.includes(CONST.ERROR.MISSING_ABA_DEPOSIT_ACCOUNT)) {
            return translate('common.downloadFailedDescription');
        }

        // We can say who's missing a bank account for single reports only
        const submitterAccountID = reports.length === 1 ? reports.at(0)?.ownerAccountID : undefined;
        const name = getDisplayNameForParticipant({accountID: submitterAccountID, shouldFallbackToHidden: false, formatPhoneNumber});
        return name ? translate('iou.missingABADepositAccount', {name}) : translate('iou.submittersMissingABADepositAccount');
    };

    const downloadABAFile = (reports: ReportToPayViaABA[], policy: OnyxEntry<Policy>, {shouldReimburseHeldTransactions, onPaid}: PayReportsViaABAOptions) => {
        const abaFileRequest = payViaABA({
            reportIDs: reports.map((report) => report.reportID),
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
            onPaid,
        });
        deferModalPresentationAfterPopoverDismiss(() => {
            modal
                .showModal({component: PayViaABADownloadModal, props: {abaFileRequest, getDownloadFailedMessage: (error) => getDownloadFailedPrompt(reports, error)}})
                .then(async ({action}) => {
                    // Closing the modal early still results in reports being paid, so we still save the file once it arrives
                    if (action !== ModalActions.CLOSE) {
                        return;
                    }
                    const file = await abaFileRequest;
                    if (file) {
                        await saveTextFile(file);
                    }
                })
                .catch(() => Log.warn('[usePayViaABA] Failed to pay via ABA or save the file after the download modal was closed'));
        });
    };

    // Pay via ABA is always picked from a menu, so anything blocking it is shown once that menu has closed
    const payReportsViaABA = (reports: ReportToPayViaABA[], policy: OnyxEntry<Policy>, options: PayReportsViaABAOptions = {}) => {
        if (isAccountLocked) {
            deferModalPresentationAfterPopoverDismiss(showLockedAccountModal);
            return;
        }
        if (!isUserValidated) {
            deferModalPresentationAfterPopoverDismiss(() => verifyAccountAndResume(() => downloadABAFile(reports, policy, options)));
            return;
        }
        downloadABAFile(reports, policy, options);
    };

    return {payReportsViaABA};
}

export default usePayViaABA;
