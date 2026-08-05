import useOnyx from '@hooks/useOnyx';

import {clearExportDownload} from '@libs/actions/Export';
import {getOpenExportModalIDs, subscribeToOpenExportModals} from '@libs/OpenExportModalsStore';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useSyncExternalStore} from 'react';

import ExportDownloadStatusModal from './ExportDownloadStatusModal';

/**
 * Re-surfaces a queued export that finished while the user was away. When an export becomes ready but the
 * component that started it is gone (the user navigated away, closed the tab, or reloaded), nothing catches
 * the ready update and clearStaleExportDownloads used to wipe it on the next load. This handler watches the
 * export collection and shows the status modal for any ready export that no in-session modal is currently
 * showing, so a returning user still gets their file. While a screen-owned modal owns an export it registers
 * itself, so this handler only takes over once that owner is gone.
 */
function ExportDownloadReloadHandler() {
    const [exportDownloads] = useOnyx(ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD);
    const openExportModalIDs = useSyncExternalStore(subscribeToOpenExportModals, getOpenExportModalIDs, getOpenExportModalIDs);

    const reloadEntry = Object.entries(exportDownloads ?? {}).find(([key, exportDownload]) => {
        const exportID = key.replace(ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD, '');
        return (
            exportDownload?.state === CONST.EXPORT_DOWNLOAD.STATE.READY &&
            // Concierge handoffs are delivered as a chat attachment, not through this modal.
            !exportDownload?.shouldSendFromConcierge &&
            !openExportModalIDs.has(exportID)
        );
    });

    if (!reloadEntry) {
        return null;
    }

    const exportID = reloadEntry[0].replace(ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD, '');
    const exportDownload = reloadEntry[1];

    return (
        <ExportDownloadStatusModal
            exportID={exportID}
            isVisible
            onClose={() => clearExportDownload(exportID, exportDownload)}
        />
    );
}

ExportDownloadReloadHandler.displayName = 'ExportDownloadReloadHandler';

export default ExportDownloadReloadHandler;
