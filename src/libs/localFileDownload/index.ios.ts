import {Share} from 'react-native';
import RNFetchBlob from 'react-native-blob-util';
import * as FileUtils from '../fileDownload/FileUtils';
import LocalFileDownload from './types';

/**
 * Writes a local file to the app's internal directory with the given fileName
 * and textContent, so we're able to share it using iOS' share API.
 * After the file is shared, it is removed from the internal dir.
 */
const localFileDownload: LocalFileDownload = (fileName, textContent) => {
    const newFileName = FileUtils.appendTimeToFileName(fileName);
    const dir = RNFetchBlob.fs.dirs.DocumentDir;
    const path = `${dir}/${newFileName}.txt`;

    RNFetchBlob.fs.writeFile(path, textContent, 'utf8').then(() => {
        Share.share({url: path, title: newFileName}).finally(() => {
            RNFetchBlob.fs.unlink(path);
        });
    });
};

export default localFileDownload;
