import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * Set whether an attachment is being downloaded so that a spinner can be shown.
 */
function setDownload(sourceID: string, isDownloading: boolean): Promise<void> {
    return Onyx.merge(`${ONYXKEYS.COLLECTION.DOWNLOAD}${sourceID}`, {isDownloading});
}

function clearDownloads() {
    const connectionID = Onyx.connect({
        key: ONYXKEYS.COLLECTION.DOWNLOAD,
        waitForCollectionCallback: true,
        callback: (records) => {
            Onyx.disconnect(connectionID);
            const downloadsToDelete: Record<string, null> = {};
            Object.keys(records ?? {}).forEach((recordKey) => {
                downloadsToDelete[recordKey] = null;
            });

            if (Object.keys(downloadsToDelete).length > 0) {
                Onyx.multiSet(downloadsToDelete);
            }
        },
    });
}

export {setDownload, clearDownloads};
