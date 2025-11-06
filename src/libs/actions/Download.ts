import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Set whether an attachment is being downloaded so that a spinner can be shown.
 */
function setDownload(sourceID: string, isDownloading: boolean): Promise<void | void[]> {
    return Onyx.merge(`${ONYXKEYS.COLLECTION.DOWNLOAD}${sourceID}`, {isDownloading});
}

function clearDownloads() {
    Onyx.setCollection(ONYXKEYS.COLLECTION.DOWNLOAD, {});
}

export {setDownload, clearDownloads};
