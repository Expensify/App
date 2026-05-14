import Onyx from 'react-native-onyx';
import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';

function sendExportFileFromConcierge(exportID: string) {
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
            onyxMethod: Onyx.METHOD.SET,
            key: onyxKey,
            value: null,
        },
    ];

    write(WRITE_COMMANDS.SEND_EXPORT_FILE_FROM_CONCIERGE, {exportID}, {optimisticData, failureData});
}

function clearExportDownload(exportID: string) {
    const onyxKey = `${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${exportID}` as const;

    const optimisticData: AnyOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: onyxKey,
            value: null,
        },
    ];

    write(WRITE_COMMANDS.CLEAR_EXPORT_DOWNLOAD, {exportID}, {optimisticData});
}

function clearStaleExportDownloads() {
    const connectionID = Onyx.connect({
        key: ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD,
        waitForCollectionCallback: true,
        callback: (exportDownloads) => {
            Onyx.disconnect(connectionID);
            if (!exportDownloads) {
                return;
            }
            Object.keys(exportDownloads).forEach((key) => {
                if (!exportDownloads[key]) {
                    return;
                }
                const exportID = key.replace(ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD, '');
                clearExportDownload(exportID);
            });
        },
    });
}

export {sendExportFileFromConcierge, clearExportDownload, clearStaleExportDownloads};
