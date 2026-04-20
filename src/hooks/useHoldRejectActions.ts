import type {ValueOf} from 'type-fest';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import type {SecondaryActionEntry} from '@components/MoneyReportHeaderActions/types';
import type {RejectModalAction} from '@components/MoneyReportHeaderEducationalModals';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {changeMoneyRequestHoldStatus, isCurrentUserSubmitter, isDM} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import useGetIOUReportFromReportAction from './useGetIOUReportFromReportAction';
import {useMemoizedLazyExpensifyIcons} from './useLazyAsset';
import useLocalize from './useLocalize';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import useTransactionThreadReport from './useTransactionThreadReport';

type UseHoldRejectActionsParams = {
    reportID: string | undefined;
    onHoldEducationalOpen: () => void;
    onRejectModalOpen: (action: RejectModalAction) => void;
};

type UseHoldRejectActionsReturn = Pick<
    Record<ValueOf<typeof CONST.REPORT.SECONDARY_ACTIONS>, SecondaryActionEntry>,
    typeof CONST.REPORT.SECONDARY_ACTIONS.HOLD | typeof CONST.REPORT.SECONDARY_ACTIONS.REMOVE_HOLD | typeof CONST.REPORT.SECONDARY_ACTIONS.REJECT
>;

function useHoldRejectActions({reportID, onHoldEducationalOpen, onRejectModalOpen}: UseHoldRejectActionsParams): UseHoldRejectActionsReturn {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();

    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Stopwatch', 'ThumbsDown'] as const);

    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(moneyRequestReport?.chatReportID)}`);
    const {transactionThreadReport} = useTransactionThreadReport(reportID);

    const [reportActionsForParent] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(moneyRequestReport?.reportID)}`, {canEvict: false});
    const requestParentReportAction = transactionThreadReport?.parentReportActionID ? reportActionsForParent?.[transactionThreadReport.parentReportActionID] : undefined;

    const {chatReport: chatIOUReport} = useGetIOUReportFromReportAction(requestParentReportAction);

    const iouTransactionID = isMoneyRequestAction(requestParentReportAction)
        ? (getOriginalMessage(requestParentReportAction)?.IOUTransactionID ?? CONST.DEFAULT_NUMBER_ID)
        : CONST.DEFAULT_NUMBER_ID;
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${iouTransactionID}`);

    const [dismissedRejectUseExplanation] = useOnyx(ONYXKEYS.NVP_DISMISSED_REJECT_USE_EXPLANATION);
    const [dismissedHoldUseExplanation] = useOnyx(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION);

    const isReportSubmitter = isCurrentUserSubmitter(chatIOUReport);
    const isChatReportDM = isDM(chatReport);

    return {
        [CONST.REPORT.SECONDARY_ACTIONS.HOLD]: {
            text: translate('iou.hold'),
            icon: expensifyIcons.Stopwatch,
            value: CONST.REPORT.SECONDARY_ACTIONS.HOLD,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.HOLD,
            onSelected: () => {
                if (!requestParentReportAction) {
                    throw new Error('Parent action does not exist');
                }

                if (isDelegateAccessRestricted) {
                    showDelegateNoAccessModal();
                    return;
                }

                const isDismissed = isReportSubmitter ? dismissedHoldUseExplanation : dismissedRejectUseExplanation;

                if (isDismissed || isChatReportDM) {
                    changeMoneyRequestHoldStatus(requestParentReportAction, transaction, isOffline);
                } else if (isReportSubmitter) {
                    onHoldEducationalOpen();
                } else {
                    onRejectModalOpen(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD);
                }
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.REMOVE_HOLD]: {
            text: translate('iou.unhold'),
            icon: expensifyIcons.Stopwatch,
            value: CONST.REPORT.SECONDARY_ACTIONS.REMOVE_HOLD,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.REMOVE_HOLD,
            onSelected: () => {
                if (!requestParentReportAction) {
                    throw new Error('Parent action does not exist');
                }

                if (isDelegateAccessRestricted) {
                    showDelegateNoAccessModal();
                    return;
                }

                changeMoneyRequestHoldStatus(requestParentReportAction, transaction, isOffline);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.REJECT]: {
            text: translate('common.reject'),
            icon: expensifyIcons.ThumbsDown,
            value: CONST.REPORT.SECONDARY_ACTIONS.REJECT,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.REJECT,
            onSelected: () => {
                if (isDelegateAccessRestricted) {
                    showDelegateNoAccessModal();
                    return;
                }

                if (moneyRequestReport?.reportID) {
                    Navigation.navigate(ROUTES.REJECT_EXPENSE_REPORT.getRoute(moneyRequestReport.reportID));
                }
            },
        },
    };
}

export default useHoldRejectActions;
export type {UseHoldRejectActionsParams, UseHoldRejectActionsReturn};
