import useOnyx from '@hooks/useOnyx';

import {clearExportDownload, markExportDownloadSurfaced} from '@libs/actions/Export';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

import ExportDownloadStatusModal from './ExportDownloadStatusModal';

/**
 * Renders the queued export status modal for the whole app. It watches the export collection and shows the modal
 * for the active export (preparing, ready, or failed). Because it is the single owner of the modal and reads
 * straight from Onyx, a screen only has to start an export (which writes its record); this shows the progress,
 * delivers the file when it is ready, and still surfaces it after a reload or once the screen that started it is
 * gone. There is no per-screen modal to coordinate with.
 */
function ExportDownloadStatusManager() {
    const [exportDownloads] = useOnyx(ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD);

    const activeEntry = Object.entries(exportDownloads ?? {}).find(([, exportDownload]) => {
        if (!exportDownload) {
            return false;
        }
        if (exportDownload.shouldSendFromConcierge) {
            return !exportDownload.hasBeenSurfaced;
        }
        return (
            exportDownload.state === CONST.EXPORT_DOWNLOAD.STATE.PREPARING ||
            exportDownload.state === CONST.EXPORT_DOWNLOAD.STATE.READY ||
            exportDownload.state === CONST.EXPORT_DOWNLOAD.STATE.FAILED
        );
    });

    if (!activeEntry) {
        return null;
    }

    const exportID = activeEntry[0].replace(ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD, '');
    const exportDownload = activeEntry[1];

    const handleClose = () => {
        if (exportDownload?.shouldSendFromConcierge) {
            markExportDownloadSurfaced(exportID);
            return;
        }
        // The modal blocks dismissal while still preparing, so this is belt-and-suspenders.
        if (exportDownload?.state === CONST.EXPORT_DOWNLOAD.STATE.PREPARING) {
            return;
        }
        clearExportDownload(exportID, exportDownload);
    };

    return (
        <ExportDownloadStatusModal
            exportID={exportID}
            isVisible
            onClose={handleClose}
        />
    );
}

ExportDownloadStatusManager.displayName = 'ExportDownloadStatusManager';

export default ExportDownloadStatusManager;
