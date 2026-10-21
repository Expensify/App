import {useMoneyReportTransactionThread} from '@components/MoneyReportTransactionThreadContext';

import {changeMoneyRequestHoldStatus} from '@libs/actions/IOU/Hold';
import {setNameValuePair} from '@libs/actions/User';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import {isDM, rejectMoneyRequestReason} from '@libs/ReportUtils';

import {dismissRejectUseExplanation} from '@userActions/IOU/RejectMoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import {shouldFailAllRequestsSelector} from '@selectors/Network';
import {isTrackIntentUserSelector} from '@selectors/Onboarding';

import type {RejectModalAction} from './useHoldRejectEducationalModal';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useDelegateAccountID from './useDelegateAccountID';
import useHoldRejectEducationalModal from './useHoldRejectEducationalModal';
import useHoldSubmitterEducationalModal from './useHoldSubmitterEducationalModal';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

/** Opens the hold/reject educational modals for the money report header and runs the follow-up action once the user dismisses them */
function useMoneyReportHeaderEducationalModals(reportID: string | undefined) {
    const {isOffline} = useNetwork();
    const [shouldFailAllRequests] = useOnyx(ONYXKEYS.NETWORK, {selector: shouldFailAllRequestsSelector});

    const {login: currentUserLogin, accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();

    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(moneyRequestReport?.chatReportID)}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);
    const {iouTransactionID, requestParentReportAction} = useMoneyReportTransactionThread();
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(iouTransactionID)}`);
    const [transactionViolations] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${getNonEmptyStringOnyxID(iouTransactionID)}`);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);

    const dismissModalAndUpdateUseHold = () => {
        setNameValuePair(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION, true, false, !shouldFailAllRequests);
        if (requestParentReportAction) {
            changeMoneyRequestHoldStatus(
                requestParentReportAction,
                transaction,
                policy,
                isOffline,
                currentUserLogin ?? '',
                currentUserAccountID,
                transactionViolations,
                isTrackIntentUser,
                delegateAccountID,
                rules,
            );
        }
    };

    const dismissRejectModalBasedOnAction = (rejectModalAction: RejectModalAction) => {
        if (rejectModalAction === CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD) {
            dismissRejectUseExplanation();
            if (requestParentReportAction) {
                changeMoneyRequestHoldStatus(
                    requestParentReportAction,
                    transaction,
                    policy,
                    isOffline,
                    currentUserLogin ?? '',
                    currentUserAccountID,
                    transactionViolations,
                    isTrackIntentUser,
                    delegateAccountID,
                    rules,
                );
            }
        } else if (rejectModalAction === CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT_BULK) {
            dismissRejectUseExplanation();
            if (reportID) {
                Navigation.navigate(
                    ROUTES.SEARCH_MONEY_REQUEST_REPORT_REJECT_TRANSACTIONS.getRoute({
                        reportID,
                    }),
                );
            }
        } else if (rejectModalAction === CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT_REPORT) {
            dismissRejectUseExplanation();
            if (reportID) {
                Navigation.navigate(ROUTES.REJECT_EXPENSE_REPORT.getRoute(reportID));
            }
        } else {
            dismissRejectUseExplanation();
            if (requestParentReportAction) {
                rejectMoneyRequestReason(requestParentReportAction);
            }
        }
    };

    const {showHoldOrRejectEducationalModal} = useHoldRejectEducationalModal();
    const {showHoldSubmitterEducationalModal} = useHoldSubmitterEducationalModal();

    return {
        openHoldEducational: () => showHoldSubmitterEducationalModal({isDM: isDM(chatReport)}).finally(dismissModalAndUpdateUseHold),
        openRejectModal: (action: RejectModalAction) => showHoldOrRejectEducationalModal().finally(() => dismissRejectModalBasedOnAction(action)),
    };
}

export default useMoneyReportHeaderEducationalModals;
