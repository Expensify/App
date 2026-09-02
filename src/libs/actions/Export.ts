import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import {rand64} from '@libs/NumberUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type ExportDownload from '@src/types/onyx/ExportDownload';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';

import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

// exportIDs this tab started during the current page load. This is in-memory only, so it is naturally
// scoped to this tab and cleared on reload. The manager uses it to decide it may pop the modal open for an
// export that appears while this tab is open. An export started in another tab is not in this set, so it does
// not pop open here. After a reload, eligibility is re-seeded from the records already in Onyx instead.
const locallyInitiatedExportIDs = new Set<string>();

function markExportInitiatedLocally(exportID: string) {
    locallyInitiatedExportIDs.add(exportID);
}

function wasExportInitiatedLocally(exportID: string): boolean {
    return locallyInitiatedExportIDs.has(exportID);
}

function sendExportFileFromConcierge(exportID: string, exportDownload: OnyxEntry<ExportDownload>) {
    const onyxKey = `${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${exportID}` as const;

    const optimisticData: AnyOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: onyxKey,
            value: {shouldSendFromConcierge: true},
        },
    ];

    const failureData: AnyOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: onyxKey,
            value: {shouldSendFromConcierge: exportDownload?.shouldSendFromConcierge ?? null},
        },
    ];

    write(WRITE_COMMANDS.SEND_EXPORT_FILE_FROM_CONCIERGE, {exportID}, {optimisticData, failureData});
}

function clearExportDownload(exportID: string, exportDownload: OnyxEntry<ExportDownload>) {
    locallyInitiatedExportIDs.delete(exportID);
    const onyxKey = `${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${exportID}` as const;

    const optimisticData: AnyOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: onyxKey,
            value: null,
        },
    ];

    const failureData: AnyOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: onyxKey,
            value: exportDownload ?? null,
        },
    ];

    write(WRITE_COMMANDS.CLEAR_EXPORT_DOWNLOAD, {exportID}, {optimisticData, failureData});
}

function clearStaleExportDownloads() {
    // Uses connectWithoutView instead of useOnyx to avoid subscribing the caller component
    // to the entire collection, which would cause unnecessary re-renders on every change.
    const connectionID = Onyx.connectWithoutView({
        key: ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD,
        callback: (exportDownloads) => {
            Onyx.disconnect(connectionID);
            if (!exportDownloads) {
                return;
            }
            for (const key of Object.keys(exportDownloads)) {
                const exportDownload = exportDownloads[key];
                if (!exportDownload) {
                    continue;
                }

                // Never clear a Concierge hand-off: the worker owns the record and deletes it once delivered.
                if (exportDownload.shouldSendFromConcierge) {
                    continue;
                }

                // Keep preparing and ready exports so the manager can re-surface them. Only failed leftovers are cleared here.
                if (exportDownload.state === CONST.EXPORT_DOWNLOAD.STATE.PREPARING || exportDownload.state === CONST.EXPORT_DOWNLOAD.STATE.READY) {
                    continue;
                }
                const exportID = key.replace(ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD, '');
                clearExportDownload(exportID, exportDownload);
            }
        },
    });
}

function exportReportsToPDF(reportIDs: string[]): string {
    const exportID = rand64();
    const onyxKey = `${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${exportID}` as const;

    const optimisticData: AnyOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: onyxKey,
            value: {state: CONST.EXPORT_DOWNLOAD.STATE.PREPARING, exportType: CONST.EXPORT_DOWNLOAD.TYPE.PDF},
        },
    ];

    const failureData: AnyOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: onyxKey,
            value: {state: CONST.EXPORT_DOWNLOAD.STATE.FAILED, exportType: CONST.EXPORT_DOWNLOAD.TYPE.PDF},
        },
    ];

    markExportInitiatedLocally(exportID);

    write(WRITE_COMMANDS.EXPORT_REPORTS_TO_PDF, {reportIDs: JSON.stringify(reportIDs), exportID}, {optimisticData, failureData});

    return exportID;
}

function exportReceiptsToZip({reportIDs, transactionIDs}: {reportIDs?: string[]; transactionIDs?: string[]}): string {
    const exportID = rand64();
    const onyxKey = `${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${exportID}` as const;

    const optimisticData: AnyOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: onyxKey,
            value: {state: CONST.EXPORT_DOWNLOAD.STATE.PREPARING, exportType: CONST.EXPORT_DOWNLOAD.TYPE.RECEIPTS},
        },
    ];

    const failureData: AnyOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: onyxKey,
            value: {state: CONST.EXPORT_DOWNLOAD.STATE.FAILED, exportType: CONST.EXPORT_DOWNLOAD.TYPE.RECEIPTS},
        },
    ];

    markExportInitiatedLocally(exportID);

    write(
        WRITE_COMMANDS.EXPORT_RECEIPTS_TO_ZIP,
        {
            exportID,
            reportIDs: reportIDs ? JSON.stringify(reportIDs) : undefined,
            transactionIDs: transactionIDs ? JSON.stringify(transactionIDs) : undefined,
        },
        {optimisticData, failureData},
    );

    return exportID;
}

export {sendExportFileFromConcierge, clearExportDownload, clearStaleExportDownloads, markExportInitiatedLocally, wasExportInitiatedLocally, exportReportsToPDF, exportReceiptsToZip};
