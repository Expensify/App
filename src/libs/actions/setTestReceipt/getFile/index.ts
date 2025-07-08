import ReactNativeBlobUtil from 'react-native-blob-util';
import RNFS from 'react-native-fs';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import type GetFile from './types';

const getFile: GetFile = (source, path, assetExtension) => {
    if (CONFIG.ENVIRONMENT === CONST.ENVIRONMENT.DEV) {
        return ReactNativeBlobUtil.config({
            fileCache: true,
            appendExt: assetExtension,
            path,
        }).fetch('GET', source);
    }

    return RNFS.copyFileRes(`${source}.${assetExtension}`, path);
};

export default getFile;
