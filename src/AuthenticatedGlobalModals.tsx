import React from 'react';
import DelegateNoAccessModalProvider from './components/DelegateNoAccessModalProvider';
import EmojiPicker from './components/EmojiPicker/EmojiPicker';
import GrowlNotification from './components/GrowlNotification';
import ProactiveAppReviewModalManager from './components/ProactiveAppReviewModalManager';
import ScreenShareRequestModal from './components/ScreenShareRequestModal';
import * as EmojiPickerAction from './libs/actions/EmojiPickerAction';
import {growlRef} from './libs/Growl';
import PopoverReportActionContextMenu from './pages/inbox/report/ContextMenu/PopoverReportActionContextMenu';
import * as ReportActionContextMenu from './pages/inbox/report/ContextMenu/ReportActionContextMenu';

/**
 * Renders global modals and overlays that require an authenticated session and are mounted once at the top level.
 */
function AuthenticatedGlobalModals() {
    return (
        <>
            <GrowlNotification ref={growlRef} />
            <DelegateNoAccessModalProvider>
                {/* eslint-disable-next-line react-hooks/refs -- module-level createRef, safe to pass as ref prop */}
                <PopoverReportActionContextMenu ref={ReportActionContextMenu.contextMenuRef} />
            </DelegateNoAccessModalProvider>
            {/* eslint-disable-next-line react-hooks/refs -- module-level createRef, safe to pass as ref prop */}
            <EmojiPicker ref={EmojiPickerAction.emojiPickerRef} />
            {/* Proactive app review modal shown when user has completed a trigger action */}
            <ProactiveAppReviewModalManager />
            <ScreenShareRequestModal />
        </>
    );
}

export default AuthenticatedGlobalModals;
