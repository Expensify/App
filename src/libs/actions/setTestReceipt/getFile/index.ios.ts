import ReactNativeBlobUtil from 'react-native-blob-util';
import type {AssetExtension} from '@userActions/setTestReceipt/types';

function getFile(source: string, path: string, assetExtension: AssetExtension) {
    return ReactNativeBlobUtil.config({
        fileCache: true,
        appendExt: assetExtension,
        path,
    }).fetch('GET', source);
}

export default getFile;
