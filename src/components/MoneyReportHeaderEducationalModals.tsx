import {shouldFailAllRequestsSelector} from '@selectors/Network';
import React, {useImperativeHandle, useState} from 'react';
import type {Ref} from 'react';
import type {ValueOf} from 'type-fest';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useMoneyRequestReportPaginatedFilteredActions from '@hooks/useMoneyRequestReportPaginatedFilteredActions';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import useTransactionThreadReport from '@hooks/useTransactionThreadReport';
import {setNameValuePair} from '@libs/actions/User';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {changeMoneyRequestHoldStatus, rejectMoneyRequestReason} from '@libs/ReportUtils';
import {dismissRejectUseExplanation} from '@userActions/IOU/RejectMoneyRequest';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import HoldOrRejectEducationalModal from './HoldOrRejectEducationalModal';
import HoldSubmitterEducationalModal from './HoldSubmitterEducationalModal';

type RejectModalAction = ValueOf<
    typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD | typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT | typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT_BULK
>;

type MoneyReportHeaderEducationalModalsHandle = {
    openHoldEducational: () => void;
    openRejectModal: (action: RejectModalAction) => void;
};

type MoneyReportHeaderEducationalModalsProps = {
    reportID: string | undefined;
    ref: Ref<MoneyReportHeaderEducationalModalsHandle>;
};

function MoneyReportHeaderEducationalModals({reportID, ref}: MoneyReportHeaderEducationalModalsProps) {
    const [isHoldEducationalModalVisible, setIsHoldEducationalModalVisible] = useState(false);
    const [rejectModalAction, setRejectModalAction] = useState<RejectModalAction | null>(null);

    const {isOffline} = useNetwork();
    const [shouldFailAllRequests] = useOnyx(ONYXKEYS.NETWORK, {selector: shouldFailAllRequestsSelector});

    // Fetch report data needed for educational modals
    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const {reportActions} = useMoneyRequestReportPaginatedFilteredActions(moneyRequestReport?.reportID);
    const {transactions: reportTransactions} = useTransactionsAndViolationsForReport(moneyRequestReport?.reportID);
    const {login: currentUserLogin, accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const {transactionThreadReport} = useTransactionThreadReport(moneyRequestReport?.reportID, reportActions ?? [], {
        transactionsCollection: reportTransactions,
    });

    const requestParentReportAction =
        reportActions && transactionThreadReport?.parentReportActionID
            ? reportActions.find((action): action is OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => action.reportActionID === transactionThreadReport.parentReportActionID)
            : null;

    const iouTransactionID = isMoneyRequestAction(requestParentReportAction) ? getOriginalMessage(requestParentReportAction)?.IOUTransactionID : undefined;
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(iouTransactionID)}`);

    useImperativeHandle(ref, () => ({
        openHoldEducational: () => setIsHoldEducationalModalVisible(true),
        openRejectModal: (action: RejectModalAction) => setRejectModalAction(action),
    }));

    const dismissModalAndUpdateUseHold = () => {
        setIsHoldEducationalModalVisible(false);
        setNameValuePair(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION, true, false, !shouldFailAllRequests);
        if (requestParentReportAction) {
            changeMoneyRequestHoldStatus(requestParentReportAction, transaction, isOffline, currentUserLogin ?? '', currentUserAccountID);
        }
    };

    const dismissRejectModalBasedOnAction = () => {
        if (rejectModalAction === CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD) {
            dismissRejectUseExplanation();
            if (requestParentReportAction) {
                changeMoneyRequestHoldStatus(requestParentReportAction, transaction, isOffline, currentUserLogin ?? '', currentUserAccountID);
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
        } else {
            dismissRejectUseExplanation();
            if (requestParentReportAction) {
                rejectMoneyRequestReason(requestParentReportAction);
            }
        }
        setRejectModalAction(null);
    };

    return (
        <>
            {!!rejectModalAction && (
                <HoldOrRejectEducationalModal
                    onClose={dismissRejectModalBasedOnAction}
                    onConfirm={dismissRejectModalBasedOnAction}
                />
            )}
            {!!isHoldEducationalModalVisible && (
                <HoldSubmitterEducationalModal
                    onClose={dismissModalAndUpdateUseHold}
                    onConfirm={dismissModalAndUpdateUseHold}
                />
            )}
        </>
    );
}

export type {RejectModalAction, MoneyReportHeaderEducationalModalsHandle};
export default MoneyReportHeaderEducationalModals;
