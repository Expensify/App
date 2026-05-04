import React, {Suspense, useEffect, useState} from 'react';
import DelegateNoAccessModalProvider from './components/DelegateNoAccessModalProvider';
import EmojiPicker from './components/EmojiPicker/EmojiPicker';
import GrowlNotification from './components/GrowlNotification';
import ProactiveAppReviewModalManager from './components/ProactiveAppReviewModalManager';
import ScreenShareRequestModal from './components/ScreenShareRequestModal';
import UpdateAppModal from './components/UpdateAppModal';
import * as EmojiPickerAction from './libs/actions/EmojiPickerAction';
import {growlRef} from './libs/Growl';
import * as ReportActionContextMenu from './pages/inbox/report/ContextMenu/ReportActionContextMenu';

const LazyPopoverReportActionContextMenu = React.lazy(() => import('./pages/inbox/report/ContextMenu/PopoverReportActionContextMenu'));

// Maximum time (ms) the context menu mount can stay deferred before requestIdleCallback forces it to run,
// guaranteeing mount even if the main thread never becomes idle.
const IDLE_CALLBACK_TIMEOUT_MS = 2000;

/**
 * Renders global modals and overlays that are mounted once at the top level.
 */
function GlobalModals() {
    const [shouldRenderContextMenu, setShouldRenderContextMenu] = useState(false);

    useEffect(() => {
        // Defer loading the context menu until after startup to avoid pulling in heavy
        // dependencies (ContextMenuActions, ReportUtils, ModifiedExpenseMessage, etc.)
        // during the ManualAppStartup span.
        const id = requestIdleCallback(() => setShouldRenderContextMenu(true), {timeout: IDLE_CALLBACK_TIMEOUT_MS});

        // Allow showContextMenu() to force eager mount if the user interacts before the idle callback fires.
        ReportActionContextMenu.registerEnsureContextMenuMounted(() => setShouldRenderContextMenu(true));

        return () => {
            cancelIdleCallback(id);
            ReportActionContextMenu.registerEnsureContextMenuMounted(null);
        };
    }, []);

    return (
        <>
            <UpdateAppModal />
            {/* Those below are only available to the authenticated user. */}
            <GrowlNotification ref={growlRef} />
            <DelegateNoAccessModalProvider>
                {shouldRenderContextMenu && (
                    <Suspense fallback={null}>
                        {/* eslint-disable-next-line react-hooks/refs -- module-level createRef, safe to pass as ref prop */}
                        <LazyPopoverReportActionContextMenu ref={ReportActionContextMenu.contextMenuRef} />
                    </Suspense>
                )}
            </DelegateNoAccessModalProvider>
            {/* eslint-disable-next-line react-hooks/refs -- module-level createRef, safe to pass as ref prop */}
            <EmojiPicker ref={EmojiPickerAction.emojiPickerRef} />
            {/* Proactive app review modal shown when user has completed a trigger action */}
            <ProactiveAppReviewModalManager />
            <ScreenShareRequestModal />
        </>
    );
}

export default GlobalModals;
