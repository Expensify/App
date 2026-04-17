import {useRoute} from '@react-navigation/native';
import type {OnyxEntry} from 'react-native-onyx';
import {getReportPreviewAction} from '@libs/actions/IOU';
import DateUtils from '@libs/DateUtils';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList} from '@libs/Navigation/types';
import {rand64} from '@libs/NumberUtils';
import {getCombinedReportActions, getFilteredReportActionsForReportView, getOriginalMessage, isCreatedAction, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {
    buildOptimisticCreatedReportAction,
    buildOptimisticIOUReportAction,
    isConciergeChatReport,
    isInvoiceReport,
    isMoneyRequestReport,
    isReportTransactionThread as isReportTransactionThreadUtil,
} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Report, ReportAction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import useIsInSidePanel from './useIsInSidePanel';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import usePaginatedReportActions from './usePaginatedReportActions';
import useTransactionThread from './useTransactionThread';

type UseReportActionsPaginationResult = {
    reportActions: ReportAction[];
    allReportActions: ReportAction[];
    allReportActionIDs: string[];
    hasOlderActions: boolean;
    hasNewerActions: boolean;
    reportActionID: string | undefined;
    transactionThreadReport: OnyxEntry<Report>;
    parentReportActionForTransactionThread: ReportAction | undefined;
    shouldAddCreatedAction: boolean;
};

function useReportActionsPagination(reportID: string | undefined): UseReportActionsPaginationResult {
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const reportActionID = route?.params?.reportActionID;

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const {isOffline} = useNetwork();

    const {reportActions: unfilteredReportActions, hasOlderActions, hasNewerActions} = usePaginatedReportActions(reportID, reportActionID);
    const allReportActions = getFilteredReportActionsForReportView(unfilteredReportActions);

    const thread = useTransactionThread({reportID, report, allReportActions, isOffline});

    const isInSidePanel = useIsInSidePanel();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const isConciergeSidePanel = isInSidePanel && isConciergeChatReport(report, conciergeReportID);

    const isReportTransactionThread = isReportTransactionThreadUtil(report);
    const isInitiallyLoadingTransactionThread = isReportTransactionThread && (allReportActions ?? [])?.length <= 1;

    const lastAction = allReportActions?.at(-1);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const shouldAddCreatedAction = !isCreatedAction(lastAction) && (isMoneyRequestReport(report) || isInvoiceReport(report) || isInitiallyLoadingTransactionThread || isConciergeSidePanel);

    const reportPreviewAction = getReportPreviewAction(report?.chatReportID, report?.reportID);

    // When we are offline before opening an IOU/Expense report,
    // the total of the report and sometimes the expense aren't displayed because these actions aren't returned until `OpenReport` API is complete.
    // We generate a fake created action here if it doesn't exist to display the total whenever possible because the total just depends on report data
    // and we also generate an expense action if the number of expenses in allReportActions is less than the total number of expenses
    // to display at least one expense action to match the total data.
    let reportActionsToDisplay: ReportAction[];
    const actions = [...(allReportActions ?? [])];

    if (shouldAddCreatedAction) {
        const createdTime = lastAction?.created && DateUtils.subtractMillisecondsFromDateTime(lastAction.created, 1);
        const optimisticCreatedAction = buildOptimisticCreatedReportAction(String(report?.ownerAccountID), createdTime);
        optimisticCreatedAction.pendingAction = null;
        actions.push(optimisticCreatedAction);
    }

    if (!isMoneyRequestReport(report) || !allReportActions?.length) {
        reportActionsToDisplay = actions;
    } else {
        const moneyRequestActions = allReportActions.filter((action) => {
            const originalMessage = isMoneyRequestAction(action) ? getOriginalMessage(action) : undefined;
            return (
                isMoneyRequestAction(action) &&
                originalMessage &&
                (originalMessage?.type === CONST.IOU.REPORT_ACTION_TYPE.CREATE ||
                    !!(originalMessage?.type === CONST.IOU.REPORT_ACTION_TYPE.PAY && originalMessage?.IOUDetails) ||
                    originalMessage?.type === CONST.IOU.REPORT_ACTION_TYPE.TRACK)
            );
        });

        if (report?.total && moneyRequestActions.length < (reportPreviewAction?.childMoneyRequestCount ?? 0) && isEmptyObject(thread.transactionThreadReport)) {
            const optimisticIOUAction = buildOptimisticIOUReportAction({
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                amount: 0,
                currency: CONST.CURRENCY.USD,
                comment: '',
                participants: [],
                transactionID: rand64(),
                iouReportID: report?.reportID,
                created: DateUtils.subtractMillisecondsFromDateTime(actions.at(-1)?.created ?? '', 1),
            }) as ReportAction;
            moneyRequestActions.push(optimisticIOUAction);
            actions.splice(actions.length - 1, 0, optimisticIOUAction);
        }

        // Update pending action of created action if we have some requests that are pending
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const createdAction = actions.pop()!;
        if (moneyRequestActions.filter((action) => !!action.pendingAction).length > 0) {
            createdAction.pendingAction = CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE;
        }

        reportActionsToDisplay = [...actions, createdAction];
    }

    const reportActions = getCombinedReportActions(reportActionsToDisplay, thread.transactionThreadReportID ?? null, thread.transactionThreadReportActions ?? []);

    const allReportActionIDs = allReportActions.map((action) => action.reportActionID);

    return {
        reportActions,
        allReportActions,
        allReportActionIDs,
        hasOlderActions,
        hasNewerActions,
        reportActionID,
        transactionThreadReport: thread.transactionThreadReport,
        parentReportActionForTransactionThread: thread.parentReportActionForTransactionThread,
        shouldAddCreatedAction,
    };
}

export default useReportActionsPagination;
