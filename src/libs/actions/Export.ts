import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import {rand64} from '@libs/NumberUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type ExportDownload from '@src/types/onyx/ExportDownload';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';

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
        waitForCollectionCallback: true,
        callback: (exportDownloads) => {
            Onyx.disconnect(connectionID);
            if (!exportDownloads) {
                return;
            }
            for (const key of Object.keys(exportDownloads)) {
                const exportDownload = exportDownloads[key];
                if (!exportDownload || exportDownload.state === CONST.EXPORT_DOWNLOAD.STATE.PREPARING) {
                    continue;
                }
                const exportID = key.replace(ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD, '');
                clearExportDownload(exportID, exportDownload);
            }
        },
    });
}

function exportReportsToPDF(reportIDs: number[]): string {
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

    write(WRITE_COMMANDS.EXPORT_REPORTS_TO_PDF, {reportIDs: JSON.stringify(reportIDs), exportID}, {optimisticData, failureData});

    return exportID;
}

export {sendExportFileFromConcierge, clearExportDownload, clearStaleExportDownloads, exportReportsToPDF};
