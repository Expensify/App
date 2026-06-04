import {shouldFailAllRequestsSelector} from '@selectors/Network';
import React, {useImperativeHandle, useState} from 'react';
import type {Ref} from 'react';
import type {ValueOf} from 'type-fest';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {setNameValuePair} from '@libs/actions/User';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import {changeMoneyRequestHoldStatus, rejectMoneyRequestReason} from '@libs/ReportUtils';
import {dismissRejectUseExplanation} from '@userActions/IOU/RejectMoneyRequest';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import HoldOrRejectEducationalModal from './HoldOrRejectEducationalModal';
import HoldSubmitterEducationalModal from './HoldSubmitterEducationalModal';
import {useMoneyReportTransactionThread} from './MoneyReportTransactionThreadContext';

type RejectModalAction = ValueOf<
    | typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD
    | typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT
    | typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT_BULK
    | typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT_REPORT
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

    const {login: currentUserLogin, accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const {iouTransactionID, requestParentReportAction} = useMoneyReportTransactionThread();
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
