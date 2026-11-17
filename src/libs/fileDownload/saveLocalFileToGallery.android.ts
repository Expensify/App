import fileURIToPath from '@libs/fileURIToPath';

import RNFetchBlob from 'react-native-blob-util';

import {getFileName} from './FileUtils';

/** Copies into Download/Expensify with no alert and resolves to the content URI of the saved file. Name is used as given; callers append a timestamp if they need collision-free names. */
function saveLocalFileToGallery(localPath: string, fileName?: string, mimeType?: string): Promise<string | undefined> {
    const sourcePath = fileURIToPath(localPath);
    return RNFetchBlob.MediaCollection.copyToMediaStore(
        {
            name: fileName ?? getFileName(localPath),
            parentFolder: 'Expensify',
            mimeType: mimeType ?? null,
        },
        'Download',
        sourcePath,
    );
}

export default saveLocalFileToGallery;
