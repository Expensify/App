import RNFetchBlob from 'react-native-blob-util';
import {getMimeType, showGeneralErrorAlert, showSuccessAlert, splitExtensionFromFileName} from '@libs/fileDownload/FileUtils';
import localFileCreate from '@libs/localFileCreate';
import type LocalFileDownload from './types';

/**
 * Writes a local file to the app's internal directory with the given fileName
 * and textContent, so we're able to copy it to the Android public download dir.
 * After the file is copied, it is removed from the internal dir.
 */
const localFileDownload: LocalFileDownload = (fileName, textContent, translate, successMessage, shouldShowSuccessAlert) => {
    localFileCreate(fileName, textContent).then(({path, newFileName}) => {
        const {fileExtension} = splitExtensionFromFileName(newFileName);
        RNFetchBlob.MediaCollection.copyToMediaStore(
            {
                name: newFileName,
                parentFolder: '', // subdirectory in the Media Store, empty goes to 'Downloads'
                mimeType: getMimeType(fileExtension),
            },
            'Download',
            path,
        )
            .then(() => {
                if (!shouldShowSuccessAlert) {
                    return;
                }
                showSuccessAlert(translate, successMessage);
            })
            .catch(() => {
                showGeneralErrorAlert(translate);
            })
            .finally(() => {
                RNFetchBlob.fs.unlink(path);
            });
    });
};

export default localFileDownload;
