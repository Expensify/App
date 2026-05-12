import React, {startTransition, useEffect, useState} from 'react';
import DelegateNoAccessModalProvider from './components/DelegateNoAccessModalProvider';
import EmojiPicker from './components/EmojiPicker/EmojiPicker';
import GrowlNotification from './components/GrowlNotification';
import LazyModalSlot from './components/LazyModalSlot';
import * as EmojiPickerAction from './libs/actions/EmojiPickerAction';
import {growlRef} from './libs/Growl';
import * as ReportActionContextMenu from './pages/inbox/report/ContextMenu/ReportActionContextMenu';

const LazyPopoverReportActionContextMenu = React.lazy(() => import('./pages/inbox/report/ContextMenu/PopoverReportActionContextMenu'));
const LazyUpdateAppModal = React.lazy(() => import('./components/UpdateAppModal'));
const LazyScreenShareRequestModal = React.lazy(() => import('./components/ScreenShareRequestModal'));
const LazyProactiveAppReviewModalManager = React.lazy(() => import('./components/ProactiveAppReviewModalManager'));

// Maximum time (ms) the context menu mount can stay deferred before requestIdleCallback forces it to run,
// guaranteeing mount even if the main thread never becomes idle.
const IDLE_CALLBACK_TIMEOUT_MS = 2000;

/**
 * Renders global modals and overlays that are mounted once at the top level.
 */
function GlobalModals() {
    const [shouldRenderContextMenu, setShouldRenderContextMenu] = useState(false);
    const [shouldRenderDeferredModals, setShouldRenderDeferredModals] = useState(false);

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
                <>
                    {/* Order matters: BaseModal hardcodes zIndex: 1 on every modal, so DOM source order
                        determines stacking when modals coincide. UpdateAppModal is last so the forced-update
                        prompt sits on top if it ever overlaps with the others. */}
                    <LazyModalSlot>
                        {/* Proactive app review modal shown when user has completed a trigger action */}
                        <LazyProactiveAppReviewModalManager />
                    </LazyModalSlot>
                    <LazyModalSlot>
                        <LazyScreenShareRequestModal />
                    </LazyModalSlot>
                    <LazyModalSlot>
                        <LazyUpdateAppModal />
                    </LazyModalSlot>
                </>
            )}
        </>
    );
}

export default GlobalModals;
