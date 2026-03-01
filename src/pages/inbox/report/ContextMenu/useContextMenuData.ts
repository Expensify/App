import type {RefObject} from 'react';
import {InteractionManager} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import {useSession} from '@components/OnyxListItemProvider';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
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
    isUnread,
    isInvoiceReport as ReportUtilsIsInvoiceReport,
    isMoneyRequest as ReportUtilsIsMoneyRequest,
    isMoneyRequestReport as ReportUtilsIsMoneyRequestReport,
    isTrackExpenseReport as ReportUtilsIsTrackExpenseReport,
} from '@libs/ReportUtils';
import {isAnonymousUser, signOutAndRedirectToSignIn} from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OriginalMessageIOU, ReportAction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {ActionId} from './actions/actionConfig';
import {ORDERED_ACTION_SHOULD_SHOW, RESTRICTED_READONLY_ACTION_IDS} from './actions/actionConfig';
import type {ContextMenuAnchor, ContextMenuType} from './ReportActionContextMenu';
import {hideContextMenu} from './ReportActionContextMenu';

const EMPTY_SET = new Set<string>();

type UseContextMenuDataParams = {
    reportID: string | undefined;
    reportActionID: string | undefined;
    originalReportID: string | undefined;
    draftMessage: string;
    selection: string;
    type: ContextMenuType;
    anchor: RefObject<ContextMenuAnchor> | undefined;
};

function useContextMenuData({reportID, reportActionID, originalReportID, draftMessage, selection, type, anchor}: UseContextMenuDataParams) {
    const {translate, getLocalDateFromDatetime} = useLocalize();
    const {isOffline} = useNetwork();
    const {isProduction} = useEnvironment();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const encryptedAuthToken = useSession()?.encryptedAuthToken ?? '';
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();

    const [betas] = useOnyx(ONYXKEYS.BETAS);
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
    const isPinnedChat = !!report?.isPinned;
    const isUnreadChat = isUnread(report, undefined, isOriginalReportArchived);
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

    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    const card = useGetExpensifyCardFromReportAction({reportAction: (reportAction ?? null) as ReportAction, policyID});

    const interceptAnonymousUser = (callback: () => void, isAnonymousAction = false) => {
        if (isAnonymousUser() && !isAnonymousAction) {
            hideContextMenu(false);
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            InteractionManager.runAfterInteractions(() => {
                signOutAndRedirectToSignIn();
            });
        } else {
            callback();
        }
    };

    const shouldShowArgs = {
        type,
        reportAction,
        childReportActions,
        isArchivedRoom,
        betas,
        menuTarget: anchor,
        isChronosReport,
        reportID,
        isPinnedChat,
        isUnreadChat,
        isThreadReportParentAction,
        isOffline: !!isOffline,
        isProduction,
        moneyRequestAction,
        areHoldRequirementsMet,
        isDebugModeEnabled,
        iouTransaction,
        transactions,
        moneyRequestReport,
        moneyRequestPolicy,
        isHarvestReport,
    };

    const getVisibleActionIDs = (): ActionId[] =>
        ORDERED_ACTION_SHOULD_SHOW.filter((entry) => entry.id !== 'overflowMenu' && !disabledActionIDs.has(entry.id) && entry.shouldShow(shouldShowArgs)).map((entry) => entry.id);

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
        isPinnedChat,
        isUnreadChat,
        isThreadReportParentAction,
        isOffline: !!isOffline,
        isProduction,
        isHarvestReport,
        isTryNewDotNVPDismissed,
        isDelegateAccessRestricted: !!isDelegateAccessRestricted,
        areHoldRequirementsMet,
        isDebugModeEnabled,
        betas,
        transactions,
        introSelected,
        movedFromReport,
        movedToReport,
        harvestReport,
        download,
        disabledActionIDs,
        interceptAnonymousUser,
        showDelegateNoAccessModal,
        translate,
        getLocalDateFromDatetime,
        type,
        reportID,
        originalReportID,
        draftMessage,
        selection,
        anchor,
        getVisibleActionIDs,
    };
}

export default useContextMenuData;
export type {UseContextMenuDataParams};
