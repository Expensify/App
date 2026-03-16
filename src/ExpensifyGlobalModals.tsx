import React from 'react';
import DelegateNoAccessModalProvider from './components/DelegateNoAccessModalProvider';
import EmojiPicker from './components/EmojiPicker/EmojiPicker';
import GrowlNotification from './components/GrowlNotification';
import ProactiveAppReviewModalManager from './components/ProactiveAppReviewModalManager';
import ScreenShareRequestModal from './components/ScreenShareRequestModal';
import UpdateAppModal from './components/UpdateAppModal';
import useOnyx from './hooks/useOnyx';
import * as EmojiPickerAction from './libs/actions/EmojiPickerAction';
import {growlRef} from './libs/Growl';
import ONYXKEYS from './ONYXKEYS';
import PopoverReportActionContextMenu from './pages/inbox/report/ContextMenu/PopoverReportActionContextMenu';
import * as ReportActionContextMenu from './pages/inbox/report/ContextMenu/ReportActionContextMenu';

type ExpensifyGlobalModalsProps = {
    updateRequired: boolean | undefined;
};

/**
 * Renders global modals and pickers (GrowlNotification, DelegateNoAccessModal,
 * EmojiPicker, UpdateAppModal, etc.) that are mounted once at the top level.
 */
function ExpensifyGlobalModals({updateRequired}: ExpensifyGlobalModalsProps) {
    const [updateAvailable] = useOnyx(ONYXKEYS.UPDATE_AVAILABLE, {initWithStoredValues: false});

    return (
        <>
            <GrowlNotification ref={growlRef} />
            <DelegateNoAccessModalProvider>
                {/* eslint-disable-next-line react-hooks/refs -- module-level createRef, safe to pass as ref prop */}
                <PopoverReportActionContextMenu ref={ReportActionContextMenu.contextMenuRef} />
            </DelegateNoAccessModalProvider>
            {/* eslint-disable-next-line react-hooks/refs -- module-level createRef, safe to pass as ref prop */}
            <EmojiPicker ref={EmojiPickerAction.emojiPickerRef} />
            {updateAvailable && !updateRequired ? <UpdateAppModal /> : null}
            <ProactiveAppReviewModalManager />
            <ScreenShareRequestModal />
        </>
    );
}

ExpensifyGlobalModals.displayName = 'ExpensifyGlobalModals';

export default React.memo(ExpensifyGlobalModals);
