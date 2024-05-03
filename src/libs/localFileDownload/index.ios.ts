import {Share} from 'react-native';
import RNFetchBlob from 'react-native-blob-util';
import FileTypes from '@libs/FileTypes';
import localFileCreate from '@libs/localFileCreate';
import type LocalFileDownload from './types';

/**
 * Writes a local file to the app's internal directory with the given fileName
 * and textContent, so we're able to share it using iOS' share API.
 * After the file is shared, it is removed from the internal dir.
 */
const localFileDownload: LocalFileDownload = (fileName, textContent, fileType = FileTypes.TEXT) => {
    localFileCreate(fileName, textContent, fileType).then(({path, newFileName}) => {
        Share.share({url: path, title: newFileName}).finally(() => {
            RNFetchBlob.fs.unlink(path);
        });
    });
};

export default localFileDownload;
