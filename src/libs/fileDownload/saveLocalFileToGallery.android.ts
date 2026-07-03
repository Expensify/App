import RNFetchBlob from 'react-native-blob-util';

import {getFileName} from './FileUtils';

/** Copies into Download/Expensify with no alert. Name is used as given; callers append a timestamp if they need collision-free names. */
function saveLocalFileToGallery(localPath: string, fileName?: string, mimeType?: string): Promise<void> {
    const sourcePath = localPath.startsWith('file://') ? decodeURI(localPath) : localPath;
    return RNFetchBlob.MediaCollection.copyToMediaStore(
        {
            name: fileName ?? getFileName(localPath),
            parentFolder: 'Expensify',
            mimeType: mimeType ?? null,
        },
        'Download',
        sourcePath,
    ).then(() => undefined);
}

export default saveLocalFileToGallery;
