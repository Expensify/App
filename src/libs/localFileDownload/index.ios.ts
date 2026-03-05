import {Share} from 'react-native';
import RNFetchBlob from 'react-native-blob-util';
import localFileCreate from '@libs/localFileCreate';
import type LocalFileDownload from './types';

/**
 * Writes a local file to the app's internal directory with the given fileName
 * and textContent, so we're able to share it using iOS' share API.
 * After the file is shared, it is removed from the internal dir.
 */
const localFileDownload: LocalFileDownload = (fileName, textContent, _translate, _successMessage, onSuccess) => {
    localFileCreate(fileName, textContent).then(({path, newFileName}) => {
        Share.share({url: path, title: newFileName})
            .then((result) => {
                if (result.action !== Share.sharedAction) {
                    return;
                }
                onSuccess?.();
            })
            .finally(() => {
                RNFetchBlob.fs.unlink(path);
            });
    });
};

export default localFileDownload;
