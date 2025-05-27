import ReactNativeBlobUtil from 'react-native-blob-util';
import RNFS from 'react-native-fs';
import type {AssetExtension} from '@userActions/setTestReceipt/types';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';

function getFile(source: string, path: string, assetExtension: AssetExtension) {
    if (CONFIG.ENVIRONMENT === CONST.ENVIRONMENT.DEV) {
        return ReactNativeBlobUtil.config({
            fileCache: true,
            appendExt: assetExtension,
            path,
        }).fetch('GET', source);
    }

    return RNFS.copyFileRes(`${source}.${assetExtension}`, path);
}

export default getFile;
