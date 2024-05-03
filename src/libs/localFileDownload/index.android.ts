import RNFetchBlob from 'react-native-blob-util';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import FileTypes from '@libs/FileTypes';
import localFileCreate from '@libs/localFileCreate';
import type LocalFileDownload from './types';

/**
 * Writes a local file to the app's internal directory with the given fileName
 * and textContent, so we're able to copy it to the Android public download dir.
 * After the file is copied, it is removed from the internal dir.
 */
const localFileDownload: LocalFileDownload = (fileName, textContent, fileType = FileTypes.TEXT) => {
    localFileCreate(fileName, textContent, fileType).then(({path, newFileName}) => {
        RNFetchBlob.MediaCollection.copyToMediaStore(
            {
                name: newFileName,
                parentFolder: '', // subdirectory in the Media Store, empty goes to 'Downloads'
                mimeType: fileType.mimeType,
            },
            'Download',
            path,
        )
            .then(() => {
                FileUtils.showSuccessAlert();
            })
            .catch(() => {
                FileUtils.showGeneralErrorAlert();
            })
            .finally(() => {
                RNFetchBlob.fs.unlink(path);
            });
    });
};

export default localFileDownload;
