import useOnyx from '@hooks/useOnyx';

import {clearExportDownload} from '@libs/actions/Export';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useState} from 'react';

import ExportDownloadStatusModal from './ExportDownloadStatusModal';

/**
 * Renders the export status modal for the whole app. It watches the export collection and shows the modal
 * for the active export (preparing, ready, or failed). Because it is the single owner of the modal and reads
 * straight from Onyx, a screen only has to start an export (which writes its record); this shows the progress,
 * delivers the file when it is ready, and still surfaces it after a reload or once the screen that started it is
 * gone. There is no per-screen modal to coordinate with.
 */
function ExportDownloadStatusManager() {
    const [exportDownloads] = useOnyx(ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD);
    const [openExportID, setOpenExportID] = useState<string | undefined>();

    const freshCandidate = Object.entries(exportDownloads ?? {}).find(([, exportDownload]) => {
        if (!exportDownload) {
            return false;
        }
        if (exportDownload.shouldSendFromConcierge) {
            return false;
        }
        return exportDownload.state === CONST.EXPORT_DOWNLOAD.STATE.PREPARING || exportDownload.state === CONST.EXPORT_DOWNLOAD.STATE.READY;
    });
    const freshExportID = freshCandidate?.[0].replace(ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD, '');

    if (!openExportID && freshExportID) {
        setOpenExportID(freshExportID);
    }
    if (openExportID && !exportDownloads?.[`${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${openExportID}`]) {
        setOpenExportID(undefined);
    }

    if (!openExportID) {
        return null;
    }

    const exportDownload = exportDownloads?.[`${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${openExportID}`];
    if (!exportDownload) {
        return null;
    }

    const handleClose = () => {
        if (exportDownload.state === CONST.EXPORT_DOWNLOAD.STATE.PREPARING && !exportDownload.shouldSendFromConcierge) {
            return;
        }
        if (exportDownload.shouldSendFromConcierge) {
            setOpenExportID(undefined);
            return;
        }
        clearExportDownload(openExportID, exportDownload);
        setOpenExportID(undefined);
    };

    return (
        <ExportDownloadStatusModal
            key={openExportID}
            exportID={openExportID}
            isVisible
            onClose={handleClose}
        />
    );
}

ExportDownloadStatusManager.displayName = 'ExportDownloadStatusManager';

export default ExportDownloadStatusManager;
