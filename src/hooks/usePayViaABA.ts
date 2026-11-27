import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';
import {useModal} from '@components/Modal/Global/ModalContext';
import PayViaABADownloadModal from '@components/PayViaABADownloadModal';

import deferModalPresentationAfterPopoverDismiss from '@libs/deferModalPresentationAfterPopoverDismiss';
import type HttpsError from '@libs/Errors/HttpsError';
import Navigation from '@libs/Navigation/Navigation';
import {getDisplayNameForParticipant} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';

import {payViaABA} from '@userActions/IOU/PayMoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {hasSeenTourSelector} from '@selectors/Onboarding';
import noop from 'lodash/noop';
import {useState} from 'react';

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
 * Locked accounts are shown the locked account modal instead, workspaces with overdue billing go to the restricted action
 * page, and unvalidated accounts verify before it downloads.
 * Also returns whether a payment is still in progress, so the Pay button can show a loader.
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
    const [isDownloadingABAFile, setIsDownloadingABAFile] = useState(false);

    const getDownloadFailedPrompt = (reports: ReportToPayViaABA[], error?: HttpsError) => {
        if (!error?.message.includes(CONST.ERROR.MISSING_ABA_DEPOSIT_ACCOUNT)) {
            return translate('common.downloadFailedDescription');
        }

        // We can say who's missing a bank account for single reports only
        const submitterAccountID = reports.length === 1 ? reports.at(0)?.ownerAccountID : undefined;
        const name = getDisplayNameForParticipant({accountID: submitterAccountID, shouldFallbackToHidden: false, formatPhoneNumber});
        return name ? translate('iou.missingABADepositAccount', {name}) : translate('iou.submittersMissingABADepositAccount');
    };

    const downloadABAFile = (reports: ReportToPayViaABA[], {shouldReimburseHeldTransactions, onPaid}: PayReportsViaABAOptions) => {
        setIsDownloadingABAFile(true);
        const abaFileRequest = payViaABA({
            reportIDs: reports.map((report) => report.reportID),
            shouldReimburseHeldTransactions,
            introSelected,
            isSelfTourViewed,
            currentUserAccountID: accountID,
            conciergeChat,
            delegateAccountID,
            onPaid,
        });
        deferModalPresentationAfterPopoverDismiss(() => {
            modal.showModal({component: PayViaABADownloadModal, props: {abaFileRequest, getDownloadFailedMessage: (error) => getDownloadFailedPrompt(reports, error)}});
        });
        abaFileRequest.catch(noop).finally(() => setIsDownloadingABAFile(false));
    };

    // Pay via ABA is always picked from a menu, so anything blocking it is shown once that menu has closed
    const payReportsViaABA = (reports: ReportToPayViaABA[], policy: OnyxEntry<Policy>, options: PayReportsViaABAOptions = {}) => {
        if (isAccountLocked) {
            deferModalPresentationAfterPopoverDismiss(showLockedAccountModal);
            return;
        }
        if (policy && shouldRestrictUserBillableActions(policy, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed, accountID)) {
            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
            return;
        }
        if (!isUserValidated) {
            deferModalPresentationAfterPopoverDismiss(() => verifyAccountAndResume(() => downloadABAFile(reports, options)));
            return;
        }
        downloadABAFile(reports, options);
    };

    return {payReportsViaABA, isDownloadingABAFile};
}

export default usePayViaABA;
