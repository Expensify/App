import React, {startTransition, useEffect, useState} from 'react';

import DelegateNoAccessModalProvider from './components/DelegateNoAccessModalProvider';
import EmojiPicker from './components/EmojiPicker/EmojiPicker';
import ExpenseAddedGrowl from './components/ExpenseAddedGrowl';
import GrowlNotification from './components/GrowlNotification';
import LazyModalSlot from './components/LazyModalSlot';
import useIsAuthenticated from './hooks/useIsAuthenticated';
import * as EmojiPickerAction from './libs/actions/EmojiPickerAction';
import {growlRef} from './libs/Growl';
import * as ReportActionContextMenu from './pages/inbox/report/ContextMenu/ReportActionContextMenu';

const LazyPopoverReportActionContextMenu = React.lazy(() => import('./pages/inbox/report/ContextMenu/PopoverReportActionContextMenu'));
// Dynamic rather than static so this module graph is only fetched once the idle callback has fired.
const LazyDeferredGlobalModals = React.lazy(() => import('./components/DeferredGlobalModals'));

// Maximum time (ms) the context menu mount can stay deferred before requestIdleCallback forces it to run,
// guaranteeing mount even if the main thread never becomes idle.
const IDLE_CALLBACK_TIMEOUT_MS = 2000;

/**
 * Renders global modals and overlays that are mounted once at the top level.
 */
function GlobalModals() {
    const [shouldRenderContextMenu, setShouldRenderContextMenu] = useState(false);
    const [shouldRenderDeferredModals, setShouldRenderDeferredModals] = useState(false);
    const isAuthenticated = useIsAuthenticated();

    // Defer loading the context menu and rare-condition modals until after startup to avoid
    // pulling in their dependencies (ContextMenuActions, ReportUtils, ModifiedExpenseMessage,
    // ProactiveAppReviewModal, etc.) and their useOnyx subscriptions during the ManualAppStartup span.
    useEffect(() => {
        const id = requestIdleCallback(
            () => {
                startTransition(() => {
                    setShouldRenderContextMenu(true);
                    setShouldRenderDeferredModals(true);
                });
            },
            {timeout: IDLE_CALLBACK_TIMEOUT_MS},
        );
        return () => cancelIdleCallback(id);
    }, []);

    // Allow showContextMenu() to force eager mount if the user interacts before the idle callback fires.
    useEffect(() => {
        ReportActionContextMenu.registerEnsureContextMenuMounted(() => setShouldRenderContextMenu(true));
        return () => ReportActionContextMenu.registerEnsureContextMenuMounted(null);
    }, []);

    return (
        <>
            <GrowlNotification ref={growlRef} />
            {isAuthenticated && <ExpenseAddedGrowl />}
            <DelegateNoAccessModalProvider>
                {shouldRenderContextMenu && (
                    <LazyModalSlot>
                        {/* eslint-disable-next-line react-hooks/refs -- module-level createRef, safe to pass as ref prop */}
                        <LazyPopoverReportActionContextMenu ref={ReportActionContextMenu.contextMenuRef} />
                    </LazyModalSlot>
                )}
            </DelegateNoAccessModalProvider>
            {/* eslint-disable-next-line react-hooks/refs -- module-level createRef, safe to pass as ref prop */}
            <EmojiPicker ref={EmojiPickerAction.emojiPickerRef} />
            {shouldRenderDeferredModals && (
                <LazyModalSlot>
                    <LazyDeferredGlobalModals />
                </LazyModalSlot>
            )}
        </>
    );
}

export default GlobalModals;
