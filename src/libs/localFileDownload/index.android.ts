import RNFetchBlob from 'react-native-blob-util';
import * as FileUtils from '../fileDownload/FileUtils';
import LocalFileDownload from './types';

/**
 * Writes a local file to the app's internal directory with the given fileName
 * and textContent, so we're able to copy it to the Android public download dir.
 * After the file is copied, it is removed from the internal dir.
 */
const localFileDownload: LocalFileDownload = (fileName, textContent) => {
    const newFileName = FileUtils.appendTimeToFileName(fileName);
    const dir = RNFetchBlob.fs.dirs.DocumentDir;
    const path = `${dir}/${newFileName}.txt`;

    RNFetchBlob.fs.writeFile(path, textContent, 'utf8').then(() => {
        RNFetchBlob.MediaCollection.copyToMediaStore(
            {
                name: newFileName,
                parentFolder: '', // subdirectory in the Media Store, empty goes to 'Downloads'
                mimeType: 'text/plain',
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
