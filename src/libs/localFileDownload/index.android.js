import RNFetchBlob from 'react-native-blob-util';
import * as FileUtils from '../fileDownload/FileUtils';

/**
 * Writes a local file to the app's internal directory with the given fileName
 * and textContent, so we're able to copy it to the Android public download dir.
 * After the file is copied, it is removed from the internal dir.
 *
 * @param {String} fileName
 * @param {String} textContent
 */
export default function localFileDownload(fileName, textContent) {
    const dir = RNFetchBlob.fs.dirs.DocumentDir;
    const path = `${dir}/${fileName}.txt`;

    RNFetchBlob.fs.writeFile(path, textContent, 'utf8').then(() => {
        RNFetchBlob.MediaCollection.copyToMediaStore(
            {
                name: fileName,
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
}
