import type {RefObject} from 'react';
import React, {useState} from 'react';
import {InteractionManager} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {GestureResponderEvent, Text as RNText, View as ViewType} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import * as ActionSheetAwareScrollView from '@components/ActionSheetAwareScrollView';
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
import useRestoreInputFocus from '@hooks/useRestoreInputFocus';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getMovedReportID} from '@libs/ModifiedExpenseMessage';
import {getLinkedTransactionID, getOneTransactionThreadReportID, getOriginalMessage, getReportAction, isDeletedAction, withDEWRoutedActionsObject} from '@libs/ReportActionsUtils';
import {
    chatIncludesChronosWithID,
    getHarvestOriginalReportID,
    getSourceIDFromReportAction,
    isArchivedNonExpenseReport,
    isHarvestCreatedExpenseReport,
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
import ContextMenuAction from './actions/ContextMenuAction';
import ContextMenuLayout from './ContextMenuLayout';
import {ContextMenuPayloadContext} from './ContextMenuPayloadProvider';
import type {ContextMenuPayloadContextValue} from './ContextMenuPayloadProvider';
import {useMiniContextMenuActions} from './MiniContextMenuProvider';
import type {ContextMenuAnchor, ContextMenuType} from './ReportActionContextMenu';
import {hideContextMenu, showContextMenu} from './ReportActionContextMenu';

type BaseReportActionContextMenuProps = {
    reportID: string | undefined;
    reportActionID: string | undefined;
    originalReportID: string | undefined;
    isMini?: boolean;
    isVisible?: boolean;
    selection?: string;
    draftMessage?: string;
    type?: ContextMenuType;
    anchor?: RefObject<ContextMenuAnchor>;
    isChronosReport?: boolean;
    isArchivedRoom?: boolean;
    isPinnedChat?: boolean;
    isUnreadChat?: boolean;
    isThreadReportParentAction?: boolean;
    contentRef?: RefObject<ViewType | null>;
    checkIfContextMenuActive?: () => void;
    disabledActionIds?: Set<string>;
    setIsEmojiPickerActive?: (state: boolean) => void;
};

function BaseReportActionContextMenu({
    type = CONST.CONTEXT_MENU_TYPES.REPORT_ACTION,
    anchor,
    contentRef,
    isChronosReport = false,
    isArchivedRoom = false,
    isMini = false,
    isVisible = false,
    isPinnedChat = false,
    isUnreadChat = false,
    isThreadReportParentAction = false,
    selection = '',
    draftMessage = '',
    reportActionID,
    reportID,
    originalReportID,
    checkIfContextMenuActive,
    disabledActionIds = new Set(),
    setIsEmojiPickerActive,
}: BaseReportActionContextMenuProps) {
    const {transitionActionSheetState} = ActionSheetAwareScrollView.useActionSheetAwareScrollViewActions();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const [localShouldKeepOpen, setLocalShouldKeepOpen] = useState(false);
    const miniActions = useMiniContextMenuActions();
    const shouldKeepOpen = isMini ? false : localShouldKeepOpen;
    const {translate, getLocalDateFromDatetime} = useLocalize();
    const {isOffline} = useNetwork();
    const {isProduction} = useEnvironment();

    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        canEvict: false,
        selector: withDEWRoutedActionsObject,
    });
    const [originalReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`, {
        canEvict: false,
        selector: withDEWRoutedActionsObject,
    });

    const reportAction: OnyxEntry<ReportAction> =
        isEmptyObject(originalReportActions) || reportActionID === '0' || reportActionID === '-1' || !reportActionID ? undefined : originalReportActions[reportActionID];
    const transactionID = getLinkedTransactionID(reportAction);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`);
    const [isDebugModeEnabled] = useOnyx(ONYXKEYS.IS_DEBUG_MODE_ENABLED);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${getNonEmptyStringOnyxID(reportID)}`);
    const [harvestReport] = useOnyx(
        `${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(getHarvestOriginalReportID(reportNameValuePairs?.origin, reportNameValuePairs?.originalID))}`,
        {},
    );
    const [originalReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${originalReportID}`);
    const isOriginalReportArchived = useReportIsArchived(originalReportID);
    const policyID = report?.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);

    const [movedFromReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(reportAction, CONST.REPORT.MOVE_TYPE.FROM)}`);
    const [movedToReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(reportAction, CONST.REPORT.MOVE_TYPE.TO)}`);

    const sourceID = getSourceIDFromReportAction(reportAction);

    const [download] = useOnyx(`${ONYXKEYS.COLLECTION.DOWNLOAD}${sourceID}`);

    const [childReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportAction?.childReportID}`);
    const [childReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportAction?.childReportID}`);
    const [childChatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${childReport?.chatReportID}`);
    const parentReportAction = getReportAction(childReport?.parentReportID, childReport?.parentReportActionID);
    const {reportActions: paginatedReportActions} = usePaginatedReportActions(childReport?.reportID);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const transactionThreadReportID = getOneTransactionThreadReportID(childReport, childChatReport, paginatedReportActions ?? [], isOffline);

    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transactionThreadReportID)}`);

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
    const isChildReportArchived = useReportIsArchived(childReport?.reportID);
    const isParentReportArchived = useReportIsArchived(childReport?.parentReportID);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${childReport?.parentReportID}`);
    const iouTransactionID = (getOriginalMessage(moneyRequestAction ?? reportAction) as OriginalMessageIOU)?.IOUTransactionID;
    const [iouTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(iouTransactionID)}`);
    const iouReportID = (getOriginalMessage(moneyRequestAction ?? reportAction) as OriginalMessageIOU)?.IOUReportID;
    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`);
    const [moneyRequestPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${moneyRequestReport?.policyID}`);
    const {transactions} = useTransactionsAndViolationsForReport(childReport?.reportID);
    const [tryNewDot] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);

    const isTryNewDotNVPDismissed = !!tryNewDot?.classicRedirect?.dismissed;
    const session = useSession();
    const encryptedAuthToken = session?.encryptedAuthToken ?? '';

    const isMoneyRequest = ReportUtilsIsMoneyRequest(childReport);
    const isTrackExpenseReport = ReportUtilsIsTrackExpenseReport(childReport);
    const isSingleTransactionView = isMoneyRequest || isTrackExpenseReport;
    const isMoneyRequestOrReport = isMoneyRequestReport || isSingleTransactionView;

    const areHoldRequirementsMet =
        !isInvoiceReport &&
        isMoneyRequestOrReport &&
        !isArchivedNonExpenseReport(transactionThreadReportID ? childReport : parentReport, transactionThreadReportID ? isChildReportArchived : isParentReportArchived);

    const isHarvestReport = isHarvestCreatedExpenseReport(reportNameValuePairs?.origin, reportNameValuePairs?.originalID);

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

    useRestoreInputFocus(isVisible);

    const openOverflowMenu = (event: GestureResponderEvent | MouseEvent, anchorRef: RefObject<ViewType | null>) => {
        showContextMenu({
            type: CONST.CONTEXT_MENU_TYPES.REPORT_ACTION,
            event,
            selection,
            contextMenuAnchor: anchorRef?.current as ViewType | RNText | null,
            report: {
                reportID,
                originalReportID,
                isArchivedRoom: isArchivedNonExpenseReport(originalReport, isOriginalReportArchived),
                isChronos: chatIncludesChronosWithID(originalReportID),
            },
            reportAction: {
                reportActionID: reportAction?.reportActionID,
                draftMessage,
                isThreadReportParentAction,
            },
            callbacks: {
                onShow: checkIfContextMenuActive,
                onHide: () => {
                    checkIfContextMenuActive?.();
                    if (isMini) {
                        miniActions.release();
                    } else {
                        setLocalShouldKeepOpen(false);
                    }
                },
            },
            disabledActionIds: new Set(),
            shouldCloseOnTarget: true,
            isOverflowMenu: true,
        });
    };

    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    const card = useGetExpensifyCardFromReportAction({reportAction: (reportAction ?? null) as ReportAction, policyID});

    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const payloadValue: ContextMenuPayloadContextValue = {
        type,
        reportID,
        originalReportID,
        reportActions,
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        reportAction: (reportAction ?? null) as ReportAction,
        report,
        originalReport,
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
        currentUserAccountID: currentUserPersonalDetails?.accountID,
        currentUserPersonalDetails,
        encryptedAuthToken,
        isArchivedRoom,
        isChronosReport,
        isPinnedChat,
        isUnreadChat,
        isThreadReportParentAction,
        isOffline: !!isOffline,
        isMini,
        isProduction,
        isHarvestReport,
        isTryNewDotNVPDismissed,
        isDelegateAccessRestricted: !!isDelegateAccessRestricted,
        areHoldRequirementsMet,
        isDebugModeEnabled,
        betas,
        transactions,
        introSelected,
        draftMessage,
        selection,
        movedFromReport,
        movedToReport,
        harvestReport,
        download,
        close: () => {
            if (isMini) {
                miniActions.release();
            } else {
                setLocalShouldKeepOpen(false);
            }
        },
        transitionActionSheetState,
        openContextMenu: () => {
            if (isMini) {
                miniActions.keepOpen();
            } else {
                setLocalShouldKeepOpen(true);
            }
        },
        interceptAnonymousUser,
        openOverflowMenu,
        setIsEmojiPickerActive,
        showDelegateNoAccessModal,
        translate,
        getLocalDateFromDatetime,
        anchor,
        disabledActionIds,
    };

    return (
        <ContextMenuPayloadContext.Provider value={payloadValue}>
            <ContextMenuLayout
                isMini={isMini}
                isVisible={isVisible}
                shouldKeepOpen={shouldKeepOpen}
                contentRef={contentRef}
            >
                <ContextMenuAction.EmojiReaction />
                <ContextMenuAction.ReplyInThread />
                <ContextMenuAction.MarkAsUnread />
                <ContextMenuAction.Explain />
                <ContextMenuAction.MarkAsRead />
                <ContextMenuAction.Edit />
                <ContextMenuAction.Unhold />
                <ContextMenuAction.Hold />
                <ContextMenuAction.JoinThread />
                <ContextMenuAction.LeaveThread />
                <ContextMenuAction.CopyURL />
                <ContextMenuAction.CopyToClipboard />
                <ContextMenuAction.CopyEmail />
                <ContextMenuAction.CopyMessage />
                <ContextMenuAction.CopyLink />
                <ContextMenuAction.Pin />
                <ContextMenuAction.Unpin />
                <ContextMenuAction.FlagAsOffensive />
                <ContextMenuAction.Download />
                <ContextMenuAction.CopyOnyxData />
                <ContextMenuAction.Debug />
                <ContextMenuAction.Delete />
                <ContextMenuAction.OverflowMenu />
            </ContextMenuLayout>
        </ContextMenuPayloadContext.Provider>
    );
}

export default BaseReportActionContextMenu;
export type {BaseReportActionContextMenuProps};
