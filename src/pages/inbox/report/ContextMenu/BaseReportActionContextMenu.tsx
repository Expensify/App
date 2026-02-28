import type {RefObject} from 'react';
import React, {useState} from 'react';
import {InteractionManager, View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {GestureResponderEvent, Text as RNText, View as ViewType} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import * as ActionSheetAwareScrollView from '@components/ActionSheetAwareScrollView';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import {useSession} from '@components/OnyxListItemProvider';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import useGetExpensifyCardFromReportAction from '@hooks/useGetExpensifyCardFromReportAction';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useRestoreInputFocus from '@hooks/useRestoreInputFocus';
import useStyleUtils from '@hooks/useStyleUtils';
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
import type {ActionId} from './actions/actionConfig';
import {ORDERED_ACTION_SHOULD_SHOW} from './actions/actionConfig';
import ContextMenuAction from './actions/ContextMenuAction';
import {ContextMenuPayloadContext} from './ContextMenuPayloadProvider';
import type {ContextMenuPayloadContextValue} from './ContextMenuPayloadProvider';
import {useMiniContextMenuActions} from './MiniContextMenuProvider';
import type {ContextMenuAnchor, ContextMenuType} from './ReportActionContextMenu';
import {hideContextMenu, showContextMenu} from './ReportActionContextMenu';

type ContextMenuActionFocusProps = {
    isFocused: boolean;
    onFocus: () => void;
    onBlur: () => void;
};

type BaseReportActionContextMenuProps = {
    /** The ID of the report this report action is attached to. */
    reportID: string | undefined;

    /** The ID of the report action this context menu is attached to. */
    reportActionID: string | undefined;

    /** The ID of the original report from which the given reportAction is first created. */
    originalReportID: string | undefined;

    /**
     * If true, this component will be a small, row-oriented menu that displays icons but not text.
     * If false, this component will be a larger, column-oriented menu that displays icons alongside text in each row.
     */
    isMini?: boolean;

    /** Controls the visibility of this component. */
    isVisible?: boolean;

    /** The copy selection. */
    selection?: string;

    /** Draft message - if this is set the comment is in 'edit' mode */
    draftMessage?: string;

    /** String representing the context menu type [LINK, REPORT_ACTION] which controls context menu choices */
    type?: ContextMenuType;

    /** Target node which is the target of ContentMenu */
    anchor?: RefObject<ContextMenuAnchor>;

    /** Flag to check if the chat participant is Chronos */
    isChronosReport?: boolean;

    /** Whether the provided report is an archived room */
    isArchivedRoom?: boolean;

    /** Flag to check if the chat is pinned in the LHN. Used for the Pin/Unpin action */
    isPinnedChat?: boolean;

    /** Flag to check if the chat is unread in the LHN. Used for the Mark as Read/Unread action */
    isUnreadChat?: boolean;

    /**
     * Is the action a thread's parent reportAction viewed from within the thread report?
     * It will be false if we're viewing the same parent report action from the report it belongs to rather than the thread.
     */
    isThreadReportParentAction?: boolean;

    /** Content Ref */
    contentRef?: RefObject<ViewType | null>;

    /** Function to check if context menu is active */
    checkIfContextMenuActive?: () => void;

    /** List of disabled action IDs */
    disabledActionIds?: Set<string>;

    /** Function to update emoji picker state */
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
    const StyleUtils = useStyleUtils();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const {transitionActionSheetState} = ActionSheetAwareScrollView.useActionSheetAwareScrollViewActions();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const [localShouldKeepOpen, setLocalShouldKeepOpen] = useState(false);
    const miniActions = useMiniContextMenuActions();
    const {translate, getLocalDateFromDatetime} = useLocalize();
    const {isOffline} = useNetwork();
    const {isProduction} = useEnvironment();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const encryptedAuthToken = useSession()?.encryptedAuthToken ?? '';

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
    const shouldKeepOpen = isMini ? false : localShouldKeepOpen;

    useRestoreInputFocus(isVisible);

    // Evaluate which actions are visible
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
        isMini,
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

    let visibleActionIds = ORDERED_ACTION_SHOULD_SHOW.filter((entry) => !disabledActionIds.has(entry.id) && entry.shouldShow(shouldShowArgs)).map((entry) => entry.id);

    if (isMini) {
        const overflowMenuId = visibleActionIds.at(-1);
        const otherIds = visibleActionIds.slice(0, -1);
        if (otherIds.length > CONST.MINI_CONTEXT_MENU_MAX_ITEMS && overflowMenuId) {
            visibleActionIds = [...otherIds.slice(0, CONST.MINI_CONTEXT_MENU_MAX_ITEMS - 1), overflowMenuId];
        } else {
            visibleActionIds = otherIds;
        }
    }

    const visibleSet = new Set(visibleActionIds);

    const contentActionIndexes = visibleActionIds
        .map((id, index) => {
            const entry = ORDERED_ACTION_SHOULD_SHOW.find((e) => e.id === id);
            return entry?.isContentAction ? index : undefined;
        })
        .filter((index): index is number => index !== undefined);

    const shouldEnableArrowNavigation = !isMini && (isVisible || shouldKeepOpen);

    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({
        initialFocusedIndex: -1,
        disabledIndexes: contentActionIndexes,
        maxIndex: visibleActionIds.length - 1,
        isActive: shouldEnableArrowNavigation,
    });

    const getFocusProps = (id: ActionId): ContextMenuActionFocusProps => {
        const index = visibleActionIds.indexOf(id);
        return {
            isFocused: focusedIndex === index,
            onFocus: () => setFocusedIndex(index),
            onBlur: () => (index === visibleActionIds.length - 1 || index === 1) && setFocusedIndex(-1),
        };
    };

    const renderAction = (id: ActionId, Component: React.ComponentType<ContextMenuActionFocusProps>) => {
        const {isFocused, onFocus, onBlur} = getFocusProps(id);
        return (
            <Component
                isFocused={isFocused}
                onFocus={onFocus}
                onBlur={onBlur}
            />
        );
    };

    const renderOverflowMenu = () => {
        const {isFocused, onFocus, onBlur} = getFocusProps('overflowMenu');
        return (
            <ContextMenuAction.OverflowMenu
                isFocused={isFocused}
                onFocus={onFocus}
                onBlur={onBlur}
                visibleActionIds={visibleActionIds}
            />
        );
    };

    /**
     * Checks if user is anonymous. If true and the action doesn't accept for anonymous user, hides the context menu and
     * shows the sign in modal. Else, executes the callback.
     */
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

    const openOverflowMenu = (event: GestureResponderEvent | MouseEvent, anchorRef: RefObject<ViewType | null>, miniVisibleActionIds?: Set<string>) => {
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
            disabledActionIds: miniVisibleActionIds,
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

    const wrapperStyle = StyleUtils.getReportActionContextMenuStyles(isMini, shouldUseNarrowLayout);

    return (
        (isVisible || shouldKeepOpen || !isMini) && (
            <ContextMenuPayloadContext.Provider value={payloadValue}>
                <FocusTrapForModal active={!isMini && !isSmallScreenWidth && (isVisible || shouldKeepOpen)}>
                    <View
                        ref={contentRef}
                        style={wrapperStyle}
                    >
                        {visibleSet.has('emojiReaction') && <ContextMenuAction.EmojiReaction />}
                        {visibleSet.has('replyInThread') && renderAction('replyInThread', ContextMenuAction.ReplyInThread)}
                        {visibleSet.has('markAsUnread') && renderAction('markAsUnread', ContextMenuAction.MarkAsUnread)}
                        {visibleSet.has('explain') && renderAction('explain', ContextMenuAction.Explain)}
                        {visibleSet.has('markAsRead') && renderAction('markAsRead', ContextMenuAction.MarkAsRead)}
                        {visibleSet.has('edit') && renderAction('edit', ContextMenuAction.Edit)}
                        {visibleSet.has('unhold') && renderAction('unhold', ContextMenuAction.Unhold)}
                        {visibleSet.has('hold') && renderAction('hold', ContextMenuAction.Hold)}
                        {visibleSet.has('joinThread') && renderAction('joinThread', ContextMenuAction.JoinThread)}
                        {visibleSet.has('leaveThread') && renderAction('leaveThread', ContextMenuAction.LeaveThread)}
                        {visibleSet.has('copyUrl') && renderAction('copyUrl', ContextMenuAction.CopyURL)}
                        {visibleSet.has('copyToClipboard') && renderAction('copyToClipboard', ContextMenuAction.CopyToClipboard)}
                        {visibleSet.has('copyEmail') && renderAction('copyEmail', ContextMenuAction.CopyEmail)}
                        {visibleSet.has('copyMessage') && renderAction('copyMessage', ContextMenuAction.CopyMessage)}
                        {visibleSet.has('copyLink') && renderAction('copyLink', ContextMenuAction.CopyLink)}
                        {visibleSet.has('pin') && renderAction('pin', ContextMenuAction.Pin)}
                        {visibleSet.has('unpin') && renderAction('unpin', ContextMenuAction.Unpin)}
                        {visibleSet.has('flagAsOffensive') && renderAction('flagAsOffensive', ContextMenuAction.FlagAsOffensive)}
                        {visibleSet.has('download') && renderAction('download', ContextMenuAction.Download)}
                        {visibleSet.has('copyOnyxData') && renderAction('copyOnyxData', ContextMenuAction.CopyOnyxData)}
                        {visibleSet.has('debug') && renderAction('debug', ContextMenuAction.Debug)}
                        {visibleSet.has('delete') && renderAction('delete', ContextMenuAction.Delete)}
                        {visibleSet.has('overflowMenu') && renderOverflowMenu()}
                    </View>
                </FocusTrapForModal>
            </ContextMenuPayloadContext.Provider>
        )
    );
}

export default BaseReportActionContextMenu;
export type {BaseReportActionContextMenuProps, ContextMenuActionFocusProps};
