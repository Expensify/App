import lodashIsEqual from 'lodash/isEqual';
import React, {memo, useMemo, useRef, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import {OnyxEntry, withOnyx} from 'react-native-onyx';
import {ValueOf} from 'type-fest';
import ContextMenuItem from '@components/ContextMenuItem';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useStyleUtils from '@hooks/useStyleUtils';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {Beta, ReportActions} from '@src/types/onyx';
import ContextMenuActions from './ContextMenuActions';
import {hideContextMenu} from './ReportActionContextMenu';
import {GenericReportActionContextMenuProps} from './types';

type BaseReportActionContextMenuOnyxProps = {
    /** Beta features list */
    betas: OnyxEntry<Beta[]>;

    /** All of the actions of the report */
    reportActions: OnyxEntry<ReportActions>;
};

type BaseReportActionContextMenuProps = GenericReportActionContextMenuProps &
    BaseReportActionContextMenuOnyxProps & {
        /** String representing the context menu type [LINK, REPORT_ACTION] which controls context menu choices  */
        type?: ValueOf<typeof CONST.CONTEXT_MENU_TYPES>;

        /** Target node which is the target of ContentMenu */
        anchor: any;

        /** Flag to check if the chat participant is Chronos */
        isChronosReport: boolean;

        /** Whether the provided report is an archived room */
        isArchivedRoom: boolean;

        /** Flag to check if the chat is pinned in the LHN. Used for the Pin/Unpin action */
        isPinnedChat?: boolean;

        /** Flag to check if the chat is unread in the LHN. Used for the Mark as Read/Unread action */
        isUnreadChat?: boolean;

        /** Content Ref */
        contentRef: any;
    };

function BaseReportActionContextMenu({
    type = CONST.CONTEXT_MENU_TYPES.REPORT_ACTION,
    anchor = null,
    contentRef = null,
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
}: BaseReportActionContextMenuProps) {
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();
    const menuItemRefs = useRef<Record<string, {triggerPressAndUpdateSuccess: () => void}>>({});
    const [shouldKeepOpen, setShouldKeepOpen] = useState(false);
    const wrapperStyle = StyleUtils.getReportActionContextMenuStyles(isMini, isSmallScreenWidth);
    const {isOffline} = useNetwork();

    const reportAction = useMemo(() => {
        if (_.isEmpty(reportActions) || reportActionID === '0') {
            return {};
        }
        return reportActions[reportActionID] || {};
    }, [reportActions, reportActionID]);

    const shouldEnableArrowNavigation = !isMini && (isVisible || shouldKeepOpen);
    const filteredContextMenuActions = ContextMenuActions.filter((contextAction) =>
        contextAction.shouldShow(type, reportAction, isArchivedRoom, betas, anchor, isChronosReport, reportID, isPinnedChat, isUnreadChat, isOffline),
    );

    // Context menu actions that are not rendered as menu items are excluded from arrow navigation
    const nonMenuItemActionIndexes = filteredContextMenuActions.map((contextAction, index) => (typeof contextAction.renderContent === 'function' ? index : undefined));
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

            menuItemRefs.current[focusedIndex].triggerPressAndUpdateSuccess();
            setFocusedIndex(-1);
        },
        {isActive: shouldEnableArrowNavigation},
    );

    return (
        (isVisible || shouldKeepOpen) && (
            <View
                ref={contentRef}
                style={wrapperStyle}
            >
                {filteredContextMenuActions.map((contextAction, index) => {
                    const closePopup = !isMini;
                    const payload = {
                        reportAction,
                        reportID,
                        draftMessage,
                        selection,
                        close: () => setShouldKeepOpen(false),
                        openContextMenu: () => setShouldKeepOpen(true),
                        interceptAnonymousUser,
                    };

                    if (contextAction.renderContent) {
                        // make sure that renderContent isn't mixed with unsupported props
                        if (__DEV__ && (contextAction.text != null || contextAction.icon != null)) {
                            throw new Error('Dev error: renderContent() and text/icon cannot be used together.');
                        }

                        return contextAction.renderContent(closePopup, payload);
                    }

                    return (
                        <ContextMenuItem
                            ref={(ref) => {
                                menuItemRefs.current[index] = ref;
                            }}
                            icon={contextAction.icon}
                            text={translate(contextAction.textTranslateKey, {action: reportAction})}
                            successIcon={contextAction.successIcon}
                            successText={contextAction.successTextTranslateKey ? translate(contextAction.successTextTranslateKey) : undefined}
                            isMini={isMini}
                            key={contextAction.textTranslateKey}
                            onPress={() => interceptAnonymousUser(() => contextAction.onPress(closePopup, payload), contextAction.isAnonymousAction)}
                            description={contextAction.getDescription(selection, isSmallScreenWidth)}
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
