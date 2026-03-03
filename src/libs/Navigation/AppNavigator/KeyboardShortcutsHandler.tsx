import {useEffect, useRef} from 'react';
import {useSearchRouterActions} from '@components/Search/SearchRouter/SearchRouterContext';
import useArchivedReportsIdSet from '@hooks/useArchivedReportsIdSet';
import markAllMessagesAsRead from '@libs/actions/Report/MarkAllMessageAsRead';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import Navigation from '@libs/Navigation/Navigation';
import * as Modal from '@userActions/Modal';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type KeyboardShortcutsHandlerProps = {
    /** Whether the 2FA requirement page should be shown */
    shouldShowRequire2FAPage: boolean;
};

/**
 * Component that does not render anything and owns ALL global keyboard shortcuts:
 * shortcuts overview (?), search (K), new chat, and mark-all-messages-as-read.
 *
 * Extracted from AuthScreensInitHandler and MarkAllMessagesAsReadHandler to
 * centralize keyboard shortcut management in one place.
 */
function KeyboardShortcutsHandler({shouldShowRequire2FAPage}: KeyboardShortcutsHandlerProps) {
    const {toggleSearch} = useSearchRouterActions();
    const archivedReportsIdSet = useArchivedReportsIdSet();
    const archivedReportsIdSetRef = useRef(archivedReportsIdSet);

    useEffect(() => {
        archivedReportsIdSetRef.current = archivedReportsIdSet;
    }, [archivedReportsIdSet]);

    useEffect(() => {
        const shortcutsOverviewShortcutConfig = CONST.KEYBOARD_SHORTCUTS.SHORTCUTS;
        const searchShortcutConfig = CONST.KEYBOARD_SHORTCUTS.SEARCH;
        const chatShortcutConfig = CONST.KEYBOARD_SHORTCUTS.NEW_CHAT;
        const markAllMessagesAsReadShortcutConfig = CONST.KEYBOARD_SHORTCUTS.MARK_ALL_MESSAGES_AS_READ;

        const unsubscribeShortcutsOverviewShortcut = KeyboardShortcut.subscribe(
            shortcutsOverviewShortcutConfig.shortcutKey,
            () => {
                Modal.close(() => {
                    if (Navigation.isOnboardingFlow() || shouldShowRequire2FAPage) {
                        return;
                    }

                    if (Navigation.isActiveRoute(ROUTES.KEYBOARD_SHORTCUTS.getRoute(Navigation.getActiveRoute()))) {
                        return;
                    }
                    return Navigation.navigate(ROUTES.KEYBOARD_SHORTCUTS.getRoute(Navigation.getActiveRoute()));
                });
            },
            shortcutsOverviewShortcutConfig.descriptionKey,
            shortcutsOverviewShortcutConfig.modifiers,
            true,
        );

        const unsubscribeSearchShortcut = KeyboardShortcut.subscribe(
            searchShortcutConfig.shortcutKey,
            () => {
                Session.callFunctionIfActionIsAllowed(() => {
                    if (Navigation.isOnboardingFlow() || shouldShowRequire2FAPage) {
                        return;
                    }
                    toggleSearch();
                })();
            },
            shortcutsOverviewShortcutConfig.descriptionKey,
            shortcutsOverviewShortcutConfig.modifiers,
            true,
        );

        const unsubscribeChatShortcut = KeyboardShortcut.subscribe(
            chatShortcutConfig.shortcutKey,
            () => {
                if (Navigation.isOnboardingFlow() || shouldShowRequire2FAPage) {
                    return;
                }
                Session.callFunctionIfActionIsAllowed(() => Modal.close(() => Navigation.navigate(ROUTES.NEW)))();
            },
            chatShortcutConfig.descriptionKey,
            chatShortcutConfig.modifiers,
            true,
        );

        const unsubscribeMarkAllMessagesAsReadShortcut = KeyboardShortcut.subscribe(
            markAllMessagesAsReadShortcutConfig.shortcutKey,
            () => markAllMessagesAsRead(archivedReportsIdSetRef.current),
            markAllMessagesAsReadShortcutConfig.descriptionKey,
            markAllMessagesAsReadShortcutConfig.modifiers,
            true,
        );

        return () => {
            unsubscribeShortcutsOverviewShortcut();
            unsubscribeSearchShortcut();
            unsubscribeChatShortcut();
            unsubscribeMarkAllMessagesAsReadShortcut();
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

export default KeyboardShortcutsHandler;
