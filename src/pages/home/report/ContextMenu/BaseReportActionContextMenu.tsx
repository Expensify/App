import lodashIsEqual from 'lodash/isEqual';
import type {MutableRefObject, RefObject} from 'react';
import React, {memo, useMemo, useRef, useState} from 'react';
import {InteractionManager, View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {GestureResponderEvent, Text as RNText, View as ViewType} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import type {ContextMenuItemHandle} from '@components/ContextMenuItem';
import ContextMenuItem from '@components/ContextMenuItem';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useEnvironment from '@hooks/useEnvironment';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import shouldEnableContextMenuEnterShortcut from '@libs/shouldEnableContextMenuEnterShortcut';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {ContextMenuAction, ContextMenuActionPayload} from './ContextMenuActions';
import ContextMenuActions from './ContextMenuActions';
import type {ContextMenuAnchor, ContextMenuType} from './ReportActionContextMenu';
import {hideContextMenu, showContextMenu} from './ReportActionContextMenu';

type BaseReportActionContextMenuProps = {
    /** The ID of the report this report action is attached to. */
    reportID: string;

    /** The ID of the report action this context menu is attached to. */
    reportActionID: string;

    /** The ID of the original report from which the given reportAction is first created. */
    // originalReportID is used in withOnyx to get the reportActions for the original report
    // eslint-disable-next-line react/no-unused-prop-types
    originalReportID: string;

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
    anchor?: MutableRefObject<ContextMenuAnchor>;

    /** Flag to check if the chat participant is Chronos */
    isChronosReport?: boolean;

    /** Whether the provided report is an archived room */
    isArchivedRoom?: boolean;

    /** Flag to check if the chat is pinned in the LHN. Used for the Pin/Unpin action */
    isPinnedChat?: boolean;

    /** Flag to check if the chat is unread in the LHN. Used for the Mark as Read/Unread action */
    isUnreadChat?: boolean;

    /** Content Ref */
    contentRef?: RefObject<View>;

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
    selection = '',
    draftMessage = '',
    reportActionID,
    reportID,
    originalReportID,
    checkIfContextMenuActive,
    disabledActions = [],
    setIsEmojiPickerActive,
}: BaseReportActionContextMenuProps) {
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const menuItemRefs = useRef<MenuItemRefs>({});
    const [shouldKeepOpen, setShouldKeepOpen] = useState(false);
    const wrapperStyle = StyleUtils.getReportActionContextMenuStyles(isMini, shouldUseNarrowLayout);
    const {isOffline} = useNetwork();
    const {isProduction} = useEnvironment();
    const threedotRef = useRef<View>(null);

    const [betas] = useOnyx(`${ONYXKEYS.BETAS}`);
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`, {canEvict: false});

    const reportAction: OnyxEntry<ReportAction> = useMemo(() => {
        if (isEmptyObject(reportActions) || reportActionID === '0' || reportActionID === '-1') {
            return;
        }
        return reportActions[reportActionID];
    }, [reportActions, reportActionID]);

    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${(reportAction && ReportActionsUtils.getLinkedTransactionID(reportAction)) ?? -1}`);

    const sourceID = ReportUtils.getSourceIDFromReportAction(reportAction);

    const [download] = useOnyx(`${ONYXKEYS.COLLECTION.DOWNLOAD}${sourceID}`);

    const childReport = ReportUtils.getReport(reportAction?.childReportID ?? '-1');
    const parentReportAction = ReportActionsUtils.getReportAction(childReport?.parentReportID ?? '', childReport?.parentReportActionID ?? '');
    const {reportActions: paginatedReportActions} = usePaginatedReportActions(childReport?.reportID ?? '-1');

    const transactionThreadReportID = useMemo(
        () => ReportActionsUtils.getOneTransactionThreadReportID(childReport?.reportID ?? '-1', paginatedReportActions ?? [], isOffline),
        [childReport?.reportID, paginatedReportActions, isOffline],
    );

    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`);

    const isMoneyRequestReport = useMemo(() => ReportUtils.isMoneyRequestReport(childReport), [childReport]);
    const isInvoiceReport = useMemo(() => ReportUtils.isInvoiceReport(childReport), [childReport]);

    const requestParentReportAction = useMemo(() => {
        if (isMoneyRequestReport || isInvoiceReport) {
            if (!paginatedReportActions || !transactionThreadReport?.parentReportActionID) {
                return undefined;
            }
            return paginatedReportActions.find((action) => action.reportActionID === transactionThreadReport.parentReportActionID);
        }
        return parentReportAction;
    }, [parentReportAction, isMoneyRequestReport, isInvoiceReport, paginatedReportActions, transactionThreadReport?.parentReportActionID]);

    const moneyRequestAction = transactionThreadReportID ? requestParentReportAction : parentReportAction;

    const [parentReportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${childReport?.parentReportID ?? '-1'}`);
    const parentReport = ReportUtils.getReport(childReport?.parentReportID ?? '-1');

    const isMoneyRequest = useMemo(() => ReportUtils.isMoneyRequest(childReport), [childReport]);
    const isTrackExpenseReport = ReportUtils.isTrackExpenseReport(childReport);
    const isSingleTransactionView = isMoneyRequest || isTrackExpenseReport;
    const isMoneyRequestOrReport = isMoneyRequestReport || isSingleTransactionView;

    const areHoldRequirementsMet =
        !isInvoiceReport && isMoneyRequestOrReport && !ReportUtils.isArchivedRoom(transactionThreadReportID ? childReport : parentReport, parentReportNameValuePairs);

    const shouldEnableArrowNavigation = !isMini && (isVisible || shouldKeepOpen);
    let filteredContextMenuActions = ContextMenuActions.filter(
        (contextAction) =>
            !disabledActions.includes(contextAction) &&
            contextAction.shouldShow(
                type,
                reportAction,
                isArchivedRoom,
                betas,
                anchor,
                isChronosReport,
                reportID,
                isPinnedChat,
                isUnreadChat,
                !!isOffline,
                isMini,
                isProduction,
                moneyRequestAction,
                areHoldRequirementsMet,
            ),
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
        if (Session.isAnonymousUser() && !isAnonymousAction) {
            hideContextMenu(false);

            InteractionManager.runAfterInteractions(() => {
                Session.signOutAndRedirectToSignIn();
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

    const openOverflowMenu = (event: GestureResponderEvent | MouseEvent, anchorRef: MutableRefObject<View | null>) => {
        showContextMenu(
            CONST.CONTEXT_MENU_TYPES.REPORT_ACTION,
            event,
            selection,
            anchorRef?.current as ViewType | RNText | null,
            reportID,
            reportAction?.reportActionID,
            originalReportID,
            draftMessage,
            checkIfContextMenuActive,
            () => {
                checkIfContextMenuActive?.();
                setShouldKeepOpen(false);
            },
            ReportUtils.isArchivedRoomWithID(originalReportID),
            ReportUtils.chatIncludesChronosWithID(originalReportID),
            undefined,
            undefined,
            filteredContextMenuActions,
            true,
            () => {},
            true,
        );
    };

    return (
        (isVisible || shouldKeepOpen) && (
            <FocusTrapForModal active={!isMini}>
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
                            draftMessage,
                            selection,
                            close: () => setShouldKeepOpen(false),
                            openContextMenu: () => setShouldKeepOpen(true),
                            interceptAnonymousUser,
                            openOverflowMenu,
                            setIsEmojiPickerActive,
                            moneyRequestAction,
                        };

                        if ('renderContent' in contextAction) {
                            return contextAction.renderContent(closePopup, payload);
                        }

                        const {textTranslateKey} = contextAction;
                        const isKeyInActionUpdateKeys =
                            textTranslateKey === 'reportActionContextMenu.editAction' ||
                            textTranslateKey === 'reportActionContextMenu.deleteAction' ||
                            textTranslateKey === 'reportActionContextMenu.deleteConfirmation';
                        const text = textTranslateKey && (isKeyInActionUpdateKeys ? translate(textTranslateKey, {action: reportAction}) : translate(textTranslateKey));
                        const transactionPayload = textTranslateKey === 'reportActionContextMenu.copyToClipboard' && transaction && {transaction};
                        const isMenuAction = textTranslateKey === 'reportActionContextMenu.menu';

                        return (
                            <ContextMenuItem
                                ref={(ref) => {
                                    menuItemRefs.current[index] = ref;
                                }}
                                buttonRef={isMenuAction ? threedotRef : {current: null}}
                                icon={contextAction.icon}
                                text={text ?? ''}
                                successIcon={contextAction.successIcon}
                                successText={contextAction.successTextTranslateKey ? translate(contextAction.successTextTranslateKey) : undefined}
                                isMini={isMini}
                                key={contextAction.textTranslateKey}
                                onPress={(event) =>
                                    interceptAnonymousUser(
                                        () => contextAction.onPress?.(closePopup, {...payload, ...transactionPayload, event, ...(isMenuAction ? {anchorRef: threedotRef} : {})}),
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
                            />
                        );
                    })}
                </View>
            </FocusTrapForModal>
        )
    );
}

export default memo(BaseReportActionContextMenu, (prevProps, nextProps) => {
    const {reportActionID: prevReportActionID, ...prevPropsWithoutReportActions} = prevProps;
    const {reportActionID: nextReportActionID, ...nextPropsWithoutReportActions} = nextProps;

    // We only want to re-render when the report action that is attached to is changed
    if (prevReportActionID !== nextReportActionID) {
        return false;
    }

    return lodashIsEqual(prevPropsWithoutReportActions, nextPropsWithoutReportActions);
});

export type {BaseReportActionContextMenuProps};
