import lodashIsEqual from 'lodash/isEqual';
import type {MutableRefObject, RefObject} from 'react';
import React, {memo, useMemo, useRef, useState} from 'react';
import {InteractionManager, View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {GestureResponderEvent, Text as RNText, View as ViewType} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import type {ContextMenuItemHandle} from '@components/ContextMenuItem';
import ContextMenuItem from '@components/ContextMenuItem';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useStyleUtils from '@hooks/useStyleUtils';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as ReportUtils from '@libs/ReportUtils';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Beta, ReportAction, ReportActions} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {ContextMenuAction, ContextMenuActionPayload} from './ContextMenuActions';
import ContextMenuActions from './ContextMenuActions';
import type {ContextMenuType} from './ReportActionContextMenu';
import {hideContextMenu, showContextMenu} from './ReportActionContextMenu';

type BaseReportActionContextMenuOnyxProps = {
    /** Beta features list */
    betas: OnyxEntry<Beta[]>;

    /** All of the actions of the report */
    reportActions: OnyxEntry<ReportActions>;
};

type BaseReportActionContextMenuProps = BaseReportActionContextMenuOnyxProps & {
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
    anchor?: MutableRefObject<HTMLElement | null>;

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
    betas,
    reportActions,
    checkIfContextMenuActive,
    disabledActions = [],
    setIsEmojiPickerActive,
}: BaseReportActionContextMenuProps) {
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();
    const menuItemRefs = useRef<MenuItemRefs>({});
    const [shouldKeepOpen, setShouldKeepOpen] = useState(false);
    const wrapperStyle = StyleUtils.getReportActionContextMenuStyles(isMini, isSmallScreenWidth);
    const {isOffline} = useNetwork();

    const reportAction: OnyxEntry<ReportAction> = useMemo(() => {
        if (isEmptyObject(reportActions) || reportActionID === '0') {
            return null;
        }
        return reportActions[reportActionID] ?? null;
    }, [reportActions, reportActionID]);

    const shouldEnableArrowNavigation = !isMini && (isVisible || shouldKeepOpen);
    let filteredContextMenuActions = ContextMenuActions.filter(
        (contextAction) =>
            !disabledActions.includes(contextAction) &&
            contextAction.shouldShow(type, reportAction, isArchivedRoom, betas, anchor, isChronosReport, reportID, isPinnedChat, isUnreadChat, !!isOffline, isMini),
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
        {isActive: shouldEnableArrowNavigation},
    );

    const openOverflowMenu = (event: GestureResponderEvent | MouseEvent) => {
        const originalReportID = ReportUtils.getOriginalReportID(reportID, reportAction);
        const originalReport = ReportUtils.getReport(originalReportID);
        showContextMenu(
            CONST.CONTEXT_MENU_TYPES.REPORT_ACTION,
            event,
            selection,
            anchor?.current as ViewType | RNText | null,
            reportID,
            reportAction?.reportActionID,
            originalReportID,
            draftMessage,
            checkIfContextMenuActive,
            () => {
                checkIfContextMenuActive?.();
                setShouldKeepOpen(false);
            },
            ReportUtils.isArchivedRoom(originalReport),
            ReportUtils.chatIncludesChronos(originalReport),
            undefined,
            undefined,
            filteredContextMenuActions,
            true,
        );
    };

    return (
        (isVisible || shouldKeepOpen) && (
            <View
                ref={contentRef}
                style={wrapperStyle}
            >
                {filteredContextMenuActions.map((contextAction, index) => {
                    const closePopup = !isMini;
                    const payload: ContextMenuActionPayload = {
                        reportAction: reportAction as ReportAction,
                        reportID,
                        draftMessage,
                        selection,
                        close: () => setShouldKeepOpen(false),
                        openContextMenu: () => setShouldKeepOpen(true),
                        interceptAnonymousUser,
                        openOverflowMenu,
                        setIsEmojiPickerActive,
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

                    return (
                        <ContextMenuItem
                            ref={(ref) => {
                                menuItemRefs.current[index] = ref;
                            }}
                            icon={contextAction.icon}
                            text={text ?? ''}
                            successIcon={contextAction.successIcon}
                            successText={contextAction.successTextTranslateKey ? translate(contextAction.successTextTranslateKey) : undefined}
                            isMini={isMini}
                            key={contextAction.textTranslateKey}
                            onPress={(event) => interceptAnonymousUser(() => contextAction.onPress?.(closePopup, {...payload, event}), contextAction.isAnonymousAction)}
                            description={contextAction.getDescription?.(selection) ?? ''}
                            isAnonymousAction={contextAction.isAnonymousAction}
                            isFocused={focusedIndex === index}
                        />
                    );
                })}
            </View>
        )
    );
}

export default withOnyx<BaseReportActionContextMenuProps, BaseReportActionContextMenuOnyxProps>({
    betas: {
        key: ONYXKEYS.BETAS,
    },
    reportActions: {
        key: ({originalReportID}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`,
        canEvict: false,
    },
})(
    memo(BaseReportActionContextMenu, (prevProps, nextProps) => {
        const {reportActions: prevReportActions, ...prevPropsWithoutReportActions} = prevProps;
        const {reportActions: nextReportActions, ...nextPropsWithoutReportActions} = nextProps;

        const prevReportAction = prevReportActions?.[prevProps.reportActionID] ?? '';
        const nextReportAction = nextReportActions?.[nextProps.reportActionID] ?? '';

        // We only want to re-render when the report action that is attached to is changed
        if (prevReportAction !== nextReportAction) {
            return false;
        }

        return lodashIsEqual(prevPropsWithoutReportActions, nextPropsWithoutReportActions);
    }),
);

export type {BaseReportActionContextMenuProps};
