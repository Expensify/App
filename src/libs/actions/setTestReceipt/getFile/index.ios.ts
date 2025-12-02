import ReactNativeBlobUtil from 'react-native-blob-util';
import type GetFile from './types';

const getFile: GetFile = (source, path, assetExtension) => {
    return ReactNativeBlobUtil.config({
        fileCache: true,
        appendExt: assetExtension,
        path,
    }).fetch('GET', source);
};

export default getFile;
