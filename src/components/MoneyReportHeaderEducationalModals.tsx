import {shouldFailAllRequestsSelector} from '@selectors/Network';
import type {ValueOf} from 'type-fest';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import {setNameValuePair} from '@libs/actions/User';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import {getFilteredReportActionsForReportView, getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {changeMoneyRequestHoldStatus, rejectMoneyRequestReason} from '@libs/ReportUtils';
import {dismissRejectUseExplanation} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import HoldOrRejectEducationalModal from './HoldOrRejectEducationalModal';
import HoldSubmitterEducationalModal from './HoldSubmitterEducationalModal';

type RejectModalAction = ValueOf<
    typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD | typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT | typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT_BULK
>;

type MoneyReportHeaderEducationalModalsProps = {
    reportID: string | undefined;
    transactionThreadReportID: string | undefined;
    isHoldEducationalVisible: boolean;
    rejectModalAction: RejectModalAction | null;
    onHoldEducationalDismissed: () => void;
    onRejectModalDismissed: () => void;
};

function MoneyReportHeaderEducationalModals({
    reportID,
    transactionThreadReportID,
    isHoldEducationalVisible,
    rejectModalAction,
    onHoldEducationalDismissed,
    onRejectModalDismissed,
}: MoneyReportHeaderEducationalModalsProps) {
    const {isOffline} = useNetwork();
    const [shouldFailAllRequests] = useOnyx(ONYXKEYS.NETWORK, {selector: shouldFailAllRequestsSelector});

    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`);
    const {reportActions: unfilteredReportActions} = usePaginatedReportActions(reportID);
    const reportActions = getFilteredReportActionsForReportView(unfilteredReportActions);

    const requestParentReportAction =
        reportActions && transactionThreadReport?.parentReportActionID
            ? reportActions.find((action): action is OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => action.reportActionID === transactionThreadReport.parentReportActionID)
            : null;

    const iouTransactionID = isMoneyRequestAction(requestParentReportAction) ? getOriginalMessage(requestParentReportAction)?.IOUTransactionID : undefined;
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(iouTransactionID)}`);

    const dismissModalAndUpdateUseHold = () => {
        onHoldEducationalDismissed();
        setNameValuePair(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION, true, false, !shouldFailAllRequests);
        if (requestParentReportAction) {
            changeMoneyRequestHoldStatus(requestParentReportAction, transaction, isOffline);
        }
    };

    const dismissRejectModalBasedOnAction = () => {
        if (rejectModalAction === CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD) {
            dismissRejectUseExplanation();
            if (requestParentReportAction) {
                changeMoneyRequestHoldStatus(requestParentReportAction, transaction, isOffline);
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
        onRejectModalDismissed();
    };

    return (
        <>
            {!!rejectModalAction && (
                <HoldOrRejectEducationalModal
                    onClose={dismissRejectModalBasedOnAction}
                    onConfirm={dismissRejectModalBasedOnAction}
                />
            )}
            {!!isHoldEducationalVisible && (
                <HoldSubmitterEducationalModal
                    onClose={dismissModalAndUpdateUseHold}
                    onConfirm={dismissModalAndUpdateUseHold}
                />
            )}
        </>
    );
}

export type {RejectModalAction};
export default MoneyReportHeaderEducationalModals;
