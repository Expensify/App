import useOnyx from '@hooks/useOnyx';

import {clearExportDownload, wasExportStartedThisSession} from '@libs/actions/Export';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

import ExportDownloadStatusModal from './ExportDownloadStatusModal';

/**
 * Re-surfaces a queued export that finished while the user was away. When an export becomes ready but the
 * component that started it is gone (the user navigated away, closed the tab, or reloaded), nothing catches
 * the ready update and clearStaleExportDownloads used to wipe it on the next load. This handler watches the
 * export collection and shows the status modal for any ready export that wasn't started in this session, so a
 * returning user still gets their file. In-session exports are handled by their own modal and skipped here.
 */
function ExportDownloadReloadHandler() {
    const [exportDownloads] = useOnyx(ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD);

    const reloadEntry = Object.entries(exportDownloads ?? {}).find(([key, exportDownload]) => {
        const exportID = key.replace(ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD, '');
        return (
            exportDownload?.state === CONST.EXPORT_DOWNLOAD.STATE.READY &&
            // Concierge handoffs are delivered as a chat attachment, not through this modal.
            !exportDownload?.shouldSendFromConcierge &&
            !wasExportStartedThisSession(exportID)
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
