import type {RefObject} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import {useSession} from '@components/OnyxListItemProvider';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useGetExpensifyCardFromReportAction from '@hooks/useGetExpensifyCardFromReportAction';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getMovedReportID} from '@libs/ModifiedExpenseMessage';
import {getLinkedTransactionID, getOneTransactionThreadReportID, getOriginalMessage, getReportAction, isDeletedAction, withDEWRoutedActionsObject} from '@libs/ReportActionsUtils';
import {
    canWriteInReport,
    chatIncludesChronosWithID,
    getHarvestOriginalReportID,
    getSourceIDFromReportAction,
    isArchivedNonExpenseReport,
    isChatThread,
    isHarvestCreatedExpenseReport,
    isInvoiceReport as ReportUtilsIsInvoiceReport,
    isMoneyRequest as ReportUtilsIsMoneyRequest,
    isMoneyRequestReport as ReportUtilsIsMoneyRequestReport,
    isTrackExpenseReport as ReportUtilsIsTrackExpenseReport,
} from '@libs/ReportUtils';
import {RESTRICTED_READONLY_ACTION_IDS} from '@pages/inbox/report/ContextMenu/actions/actionConfig';
import type {ContextMenuAnchor} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OriginalMessageIOU, ReportAction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

const EMPTY_SET = new Set<string>();

type UseContextMenuDataParams = {
    reportID: string | undefined;
    reportActionID: string | undefined;
    originalReportID: string | undefined;
    draftMessage: string;
    selection: string;
    anchor: RefObject<ContextMenuAnchor> | undefined;
};

/**
 * Aggregates all Onyx data and derived state needed for context menus.
 * Consumed by both PopoverReportActionContent (long-press menu) and MiniReportActionContextMenu (hover menu).
 */
function useReportActionContextMenuData({reportID, reportActionID, originalReportID, draftMessage, selection, anchor}: UseContextMenuDataParams) {
    const {translate, getLocalDateFromDatetime} = useLocalize();
    const {isOffline} = useNetwork();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const encryptedAuthToken = useSession()?.encryptedAuthToken ?? '';
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();

    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        canEvict: false,
        selector: withDEWRoutedActionsObject,
    });
    const [originalReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`, {
        canEvict: false,
        selector: withDEWRoutedActionsObject,
    });
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [originalReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${originalReportID}`);

    const disabledActionIDs = !canWriteInReport(report) ? RESTRICTED_READONLY_ACTION_IDS : EMPTY_SET;
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${getNonEmptyStringOnyxID(reportID)}`);
    const [isDebugModeEnabled] = useOnyx(ONYXKEYS.IS_DEBUG_MODE_ENABLED);
    const [tryNewDot] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);

    const hasValidReportAction = !isEmptyObject(originalReportActions) && reportActionID && reportActionID !== '0' && reportActionID !== '-1';
    const reportAction: OnyxEntry<ReportAction> = hasValidReportAction ? originalReportActions[reportActionID] : undefined;

    const transactionID = getLinkedTransactionID(reportAction);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`);
    const [harvestReport] = useOnyx(
        `${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(getHarvestOriginalReportID(reportNameValuePairs?.origin, reportNameValuePairs?.originalID))}`,
        {},
    );
    const policyID = report?.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
    const [movedFromReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(reportAction, CONST.REPORT.MOVE_TYPE.FROM)}`);
    const [movedToReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(reportAction, CONST.REPORT.MOVE_TYPE.TO)}`);
    const [download] = useOnyx(`${ONYXKEYS.COLLECTION.DOWNLOAD}${getSourceIDFromReportAction(reportAction)}`);

    const [childReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportAction?.childReportID}`);
    const [childReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportAction?.childReportID}`);
    const [childChatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${childReport?.chatReportID}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${childReport?.parentReportID}`);
    const parentReportAction = getReportAction(childReport?.parentReportID, childReport?.parentReportActionID);
    const {reportActions: paginatedReportActions} = usePaginatedReportActions(childReport?.reportID);
    const transactionThreadReportID = getOneTransactionThreadReportID(childReport, childChatReport, paginatedReportActions ?? [], isOffline);
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transactionThreadReportID)}`);

    const isOriginalReportArchived = useReportIsArchived(originalReportID);
    const isChildReportArchived = useReportIsArchived(childReport?.reportID);
    const isParentReportArchived = useReportIsArchived(childReport?.parentReportID);

    const isChronosReport = chatIncludesChronosWithID(originalReportID);
    const isArchivedRoom = isArchivedNonExpenseReport(originalReport, isOriginalReportArchived);
    const isThreadReportParentAction = isChatThread(report) && report?.parentReportActionID === reportAction?.reportActionID;

    const isMoneyRequestReport = ReportUtilsIsMoneyRequestReport(childReport);
    const isInvoiceReport = ReportUtilsIsInvoiceReport(childReport);
    let requestParentReportAction;
    if (isMoneyRequestReport || isInvoiceReport) {
        if (transactionThreadReportID === CONST.FAKE_REPORT_ID) {
            requestParentReportAction = Object.values(childReportActions ?? {}).find((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.IOU && !isDeletedAction(action));
        } else if (paginatedReportActions && transactionThreadReport?.parentReportActionID) {
            requestParentReportAction = paginatedReportActions.find((action) => action.reportActionID === transactionThreadReport.parentReportActionID);
        }
    } else {
        requestParentReportAction = parentReportAction;
    }
    const moneyRequestAction = transactionThreadReportID ? requestParentReportAction : parentReportAction;

    const iouTransactionID = (getOriginalMessage(moneyRequestAction ?? reportAction) as OriginalMessageIOU)?.IOUTransactionID;
    const iouReportID = (getOriginalMessage(moneyRequestAction ?? reportAction) as OriginalMessageIOU)?.IOUReportID;
    const [iouTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(iouTransactionID)}`);
    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`);
    const [moneyRequestPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${moneyRequestReport?.policyID}`);
    const {transactions} = useTransactionsAndViolationsForReport(childReport?.reportID);

    const isMoneyRequest = ReportUtilsIsMoneyRequest(childReport);
    const isTrackExpenseReport = ReportUtilsIsTrackExpenseReport(childReport);
    const isSingleTransactionView = isMoneyRequest || isTrackExpenseReport;
    const isMoneyRequestOrReport = isMoneyRequestReport || isSingleTransactionView;
    const archivedReportForHold = transactionThreadReportID ? childReport : parentReport;
    const isArchivedForHold = transactionThreadReportID ? isChildReportArchived : isParentReportArchived;
    const areHoldRequirementsMet = !isInvoiceReport && isMoneyRequestOrReport && !isArchivedNonExpenseReport(archivedReportForHold, isArchivedForHold);

    const isHarvestReport = isHarvestCreatedExpenseReport(reportNameValuePairs?.origin, reportNameValuePairs?.originalID);
    const isTryNewDotNVPDismissed = !!tryNewDot?.classicRedirect?.dismissed;

    const card = useGetExpensifyCardFromReportAction({reportAction, policyID});

    return {
        report,
        originalReport,
        reportActions,
        reportAction,
        childReport,
        childReportActions,
        policy,
        policyTags,
        moneyRequestAction,
        moneyRequestReport,
        moneyRequestPolicy,
        iouTransaction,
        transaction,
        card,
        currentUserPersonalDetails,
        encryptedAuthToken,
        isArchivedRoom,
        isChronosReport,
        isThreadReportParentAction,
        isOffline: !!isOffline,
        isHarvestReport,
        isTryNewDotNVPDismissed,
        isDelegateAccessRestricted: !!isDelegateAccessRestricted,
        areHoldRequirementsMet,
        isDebugModeEnabled,
        transactions,
        introSelected,
        movedFromReport,
        movedToReport,
        harvestReport,
        download,
        disabledActionIDs,
        showDelegateNoAccessModal,
        translate,
        getLocalDateFromDatetime,
        reportID,
        originalReportID,
        draftMessage,
        selection,
        anchor,
    };
}

export default useReportActionContextMenuData;
export type {UseContextMenuDataParams};
