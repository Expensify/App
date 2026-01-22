import {deepEqual} from 'fast-equals';
import type {RefObject} from 'react';
import React, {memo, useContext, useMemo, useRef, useState} from 'react';
import {InteractionManager, View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {GestureResponderEvent, Text as RNText, View as ViewType} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import * as ActionSheetAwareScrollView from '@components/ActionSheetAwareScrollView';
import type {ContextMenuItemHandle} from '@components/ContextMenuItem';
import ContextMenuItem from '@components/ContextMenuItem';
import {DelegateNoAccessContext} from '@components/DelegateNoAccessModalProvider';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import useGetExpensifyCardFromReportAction from '@hooks/useGetExpensifyCardFromReportAction';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
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
import shouldEnableContextMenuEnterShortcut from '@libs/shouldEnableContextMenuEnterShortcut';
import {isAnonymousUser, signOutAndRedirectToSignIn} from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OriginalMessageIOU, ReportAction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {ContextMenuAction, ContextMenuActionPayload} from './ContextMenuActions';
import ContextMenuActions from './ContextMenuActions';
import type {ContextMenuAnchor, ContextMenuType} from './ReportActionContextMenu';
import {hideContextMenu, showContextMenu} from './ReportActionContextMenu';

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

    /** String representing the context menu type [LINK, REPORT_ACTION] which controls context menu choices  */
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
    contentRef?: RefObject<View | null>;

    /** Function to check if context menu is active */
    checkIfContextMenuActive?: () => void;

    /** List of disabled actions */
    disabledActions?: ContextMenuAction[];

    /** Function to update emoji picker state */
    setIsEmojiPickerActive?: (state: boolean) => void;
};

type MenuItemRefs = Record<string, ContextMenuItemHandle | null>;

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
    disabledActions = [],
    setIsEmojiPickerActive,
}: BaseReportActionContextMenuProps) {
    const {transitionActionSheetState} = ActionSheetAwareScrollView.useActionSheetAwareScrollViewActions();
    const {isDelegateAccessRestricted, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);
    const icons = useMemoizedLazyExpensifyIcons([
        'Download',
        'ThreeDots',
        'ChatBubbleReply',
        'ChatBubbleUnread',
        'Mail',
        'Pencil',
        'Stopwatch',
        'Bell',
        'Copy',
        'LinkCopy',
        'Pin',
        'Flag',
        'Bug',
        'Trashcan',
        'Checkmark',
    ] as const);
    const StyleUtils = useStyleUtils();
    const {translate, getLocalDateFromDatetime} = useLocalize();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const menuItemRefs = useRef<MenuItemRefs>({});
    const [shouldKeepOpen, setShouldKeepOpen] = useState(false);
    const wrapperStyle = StyleUtils.getReportActionContextMenuStyles(isMini, shouldUseNarrowLayout);
    const {isOffline} = useNetwork();
    const {isProduction} = useEnvironment();
    const threeDotRef = useRef<View>(null);
    const [betas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: true});
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`, {
        canBeMissing: true,
        canEvict: false,
        selector: withDEWRoutedActionsObject,
    });

    const reportAction: OnyxEntry<ReportAction> = useMemo(() => {
        if (isEmptyObject(reportActions) || reportActionID === '0' || reportActionID === '-1' || !reportActionID) {
            return;
        }
        return reportActions[reportActionID];
    }, [reportActions, reportActionID]);
    const transactionID = getLinkedTransactionID(reportAction);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`, {canBeMissing: true});
    const [isDebugModeEnabled] = useOnyx(ONYXKEYS.IS_DEBUG_MODE_ENABLED, {canBeMissing: true});
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: true});
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${getNonEmptyStringOnyxID(reportID)}`, {canBeMissing: true});
    const [harvestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(getHarvestOriginalReportID(reportNameValuePairs?.origin, reportNameValuePairs?.originalID))}`, {
        canBeMissing: true,
    });
    const [originalReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${originalReportID}`, {canBeMissing: true});
    const isOriginalReportArchived = useReportIsArchived(originalReportID);
    const policyID = report?.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: true});
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {canBeMissing: true});

    const [movedFromReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(reportAction, CONST.REPORT.MOVE_TYPE.FROM)}`, {canBeMissing: true});
    const [movedToReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(reportAction, CONST.REPORT.MOVE_TYPE.TO)}`, {canBeMissing: true});

    const sourceID = getSourceIDFromReportAction(reportAction);

    const [download] = useOnyx(`${ONYXKEYS.COLLECTION.DOWNLOAD}${sourceID}`, {canBeMissing: true});

    const [childReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportAction?.childReportID}`, {canBeMissing: true});
    const [childReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportAction?.childReportID}`, {canBeMissing: true});
    const [childChatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${childReport?.chatReportID}`, {canBeMissing: true});
    const parentReportAction = getReportAction(childReport?.parentReportID, childReport?.parentReportActionID);
    const {reportActions: paginatedReportActions} = usePaginatedReportActions(childReport?.reportID);
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const transactionThreadReportID = useMemo(
        () => getOneTransactionThreadReportID(childReport, childChatReport, paginatedReportActions ?? [], isOffline),
        [paginatedReportActions, isOffline, childReport, childChatReport],
    );

    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transactionThreadReportID)}`, {canBeMissing: true});

    const isMoneyRequestReport = useMemo(() => ReportUtilsIsMoneyRequestReport(childReport), [childReport]);
    const isInvoiceReport = useMemo(() => ReportUtilsIsInvoiceReport(childReport), [childReport]);

    const requestParentReportAction = useMemo(() => {
        if (isMoneyRequestReport || isInvoiceReport) {
            if (transactionThreadReportID === CONST.FAKE_REPORT_ID) {
                return Object.values(childReportActions ?? {}).find((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.IOU && !isDeletedAction(action));
            }
            if (!paginatedReportActions || !transactionThreadReport?.parentReportActionID) {
                return undefined;
            }
            return paginatedReportActions.find((action) => action.reportActionID === transactionThreadReport.parentReportActionID);
        }
        return parentReportAction;
    }, [parentReportAction, isMoneyRequestReport, isInvoiceReport, paginatedReportActions, transactionThreadReport?.parentReportActionID, transactionThreadReportID, childReportActions]);

    const moneyRequestAction = transactionThreadReportID ? requestParentReportAction : parentReportAction;
    const isChildReportArchived = useReportIsArchived(childReport?.reportID);
    const isParentReportArchived = useReportIsArchived(childReport?.parentReportID);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${childReport?.parentReportID}`, {canBeMissing: true});
    const iouTransactionID = (getOriginalMessage(moneyRequestAction ?? reportAction) as OriginalMessageIOU)?.IOUTransactionID;
    const [iouTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(iouTransactionID)}`, {canBeMissing: true});
    const iouReportID = (getOriginalMessage(moneyRequestAction ?? reportAction) as OriginalMessageIOU)?.IOUReportID;
    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, {canBeMissing: true});
    const [moneyRequestPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${moneyRequestReport?.policyID}`, {canBeMissing: true});
    const {transactions} = useTransactionsAndViolationsForReport(childReport?.reportID);
    const [tryNewDot] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT, {canBeMissing: false});
    const isTryNewDotNVPDismissed = !!tryNewDot?.classicRedirect?.dismissed;

    const isMoneyRequest = useMemo(() => ReportUtilsIsMoneyRequest(childReport), [childReport]);
    const isTrackExpenseReport = ReportUtilsIsTrackExpenseReport(childReport);
    const isSingleTransactionView = isMoneyRequest || isTrackExpenseReport;
    const isMoneyRequestOrReport = isMoneyRequestReport || isSingleTransactionView;

    const areHoldRequirementsMet =
        !isInvoiceReport &&
        isMoneyRequestOrReport &&
        !isArchivedNonExpenseReport(transactionThreadReportID ? childReport : parentReport, transactionThreadReportID ? isChildReportArchived : isParentReportArchived);

    const shouldEnableArrowNavigation = !isMini && (isVisible || shouldKeepOpen);
    const isHarvestReport = isHarvestCreatedExpenseReport(reportNameValuePairs?.origin, reportNameValuePairs?.originalID);

    let filteredContextMenuActions = ContextMenuActions.filter(
        (contextAction) =>
            !disabledActions.includes(contextAction) &&
            contextAction.shouldShow({
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
                moneyRequestReport,
                moneyRequestAction,
                moneyRequestPolicy,
                areHoldRequirementsMet,
                isDebugModeEnabled,
                iouTransaction,
                transactions,
                isHarvestReport,
            }),
    );

    if (isMini) {
        const menuAction = filteredContextMenuActions.at(-1);
        const otherActions = filteredContextMenuActions.slice(0, -1);
        if (otherActions.length > CONST.MINI_CONTEXT_MENU_MAX_ITEMS && menuAction) {
            filteredContextMenuActions = otherActions.slice(0, CONST.MINI_CONTEXT_MENU_MAX_ITEMS - 1);
            filteredContextMenuActions.push(menuAction);
        } else {
            filteredContextMenuActions = otherActions;
        }
    }

    // Context menu actions that are not rendered as menu items are excluded from arrow navigation
    const nonMenuItemActionIndexes = filteredContextMenuActions.map((contextAction, index) =>
        'renderContent' in contextAction && typeof contextAction.renderContent === 'function' ? index : undefined,
    );
    const disabledIndexes = nonMenuItemActionIndexes.filter((index): index is number => index !== undefined);

    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({
        initialFocusedIndex: -1,
        disabledIndexes,
        maxIndex: filteredContextMenuActions.length - 1,
        isActive: shouldEnableArrowNavigation,
    });

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

    useKeyboardShortcut(
        CONST.KEYBOARD_SHORTCUTS.ENTER,
        (event) => {
            if (!menuItemRefs.current[focusedIndex]) {
                return;
            }

            // Ensures the event does not cause side-effects beyond the context menu, e.g. when an outside element is focused
            if (event) {
                event.stopPropagation();
            }

            menuItemRefs.current[focusedIndex]?.triggerPressAndUpdateSuccess?.();
            setFocusedIndex(-1);
        },
        {isActive: shouldEnableArrowNavigation && shouldEnableContextMenuEnterShortcut, shouldPreventDefault: false},
    );
    useRestoreInputFocus(isVisible);

    const openOverflowMenu = (event: GestureResponderEvent | MouseEvent, anchorRef: RefObject<View | null>) => {
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
                    setShouldKeepOpen(false);
                },
            },
            disabledOptions: filteredContextMenuActions,
            shouldCloseOnTarget: true,
            isOverflowMenu: true,
        });
    };

    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    const card = useGetExpensifyCardFromReportAction({reportAction: (reportAction ?? null) as ReportAction, policyID});

    return (
        (isVisible || shouldKeepOpen || !isMini) && (
            <FocusTrapForModal active={!isMini && !isSmallScreenWidth && (isVisible || shouldKeepOpen)}>
                <View
                    ref={contentRef}
                    style={wrapperStyle}
                >
                    {filteredContextMenuActions.map((contextAction, index) => {
                        const closePopup = !isMini;
                        const payload: ContextMenuActionPayload = {
                            // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
                            reportAction: (reportAction ?? null) as ReportAction,
                            reportID,
                            report,
                            draftMessage,
                            selection,
                            close: () => setShouldKeepOpen(false),
                            transitionActionSheetState,
                            openContextMenu: () => setShouldKeepOpen(true),
                            interceptAnonymousUser,
                            openOverflowMenu,
                            setIsEmojiPickerActive,
                            isHarvestReport,
                            moneyRequestAction,
                            card,
                            originalReport,
                            isTryNewDotNVPDismissed,
                            childReport,
                            movedFromReport,
                            movedToReport,
                            getLocalDateFromDatetime,
                            policy,
                            policyTags,
                            translate,
                            harvestReport,
                            isDelegateAccessRestricted,
                            showDelegateNoAccessModal,
                            currentUserAccountID,
                        };

                        if ('renderContent' in contextAction) {
                            return contextAction.renderContent(closePopup, payload);
                        }

                        const {textTranslateKey} = contextAction;
                        const isKeyInActionUpdateKeys = textTranslateKey === 'reportActionContextMenu.editAction' || textTranslateKey === 'reportActionContextMenu.deleteConfirmation';
                        const text = textTranslateKey && (isKeyInActionUpdateKeys ? translate(textTranslateKey, {action: moneyRequestAction ?? reportAction}) : translate(textTranslateKey));
                        const transactionPayload = textTranslateKey === 'reportActionContextMenu.copyMessage' && transaction && {transaction};
                        const isMenuAction = textTranslateKey === 'reportActionContextMenu.menu';
                        const icon = typeof contextAction.icon === 'string' ? icons[contextAction.icon] : contextAction.icon;
                        const successIcon = typeof contextAction.successIcon === 'string' ? icons[contextAction.successIcon] : contextAction.successIcon;

                        return (
                            <ContextMenuItem
                                ref={(ref) => {
                                    menuItemRefs.current[index] = ref;
                                }}
                                buttonRef={isMenuAction ? threeDotRef : {current: null}}
                                icon={icon}
                                text={text ?? ''}
                                successIcon={successIcon}
                                successText={contextAction.successTextTranslateKey ? translate(contextAction.successTextTranslateKey) : undefined}
                                isMini={isMini}
                                key={contextAction.textTranslateKey}
                                onPress={(event) =>
                                    interceptAnonymousUser(
                                        () => contextAction.onPress?.(closePopup, {...payload, ...transactionPayload, event, ...(isMenuAction ? {anchorRef: threeDotRef} : {})}),
                                        contextAction.isAnonymousAction,
                                    )
                                }
                                description={contextAction.getDescription?.(selection) ?? ''}
                                isAnonymousAction={contextAction.isAnonymousAction}
                                isFocused={focusedIndex === index}
                                shouldPreventDefaultFocusOnPress={contextAction.shouldPreventDefaultFocusOnPress}
                                onFocus={() => setFocusedIndex(index)}
                                onBlur={() => (index === filteredContextMenuActions.length - 1 || index === 1) && setFocusedIndex(-1)}
                                disabled={contextAction?.shouldDisable ? contextAction?.shouldDisable(download) : false}
                                shouldShowLoadingSpinnerIcon={contextAction?.shouldDisable ? contextAction?.shouldDisable(download) : false}
                                sentryLabel={contextAction.sentryLabel}
                            />
                        );
                    })}
                </View>
            </FocusTrapForModal>
        )
    );
}

// eslint-disable-next-line rulesdir/no-deep-equal-in-memo
export default memo(BaseReportActionContextMenu, deepEqual);

export type {BaseReportActionContextMenuProps};
