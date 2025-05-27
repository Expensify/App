import {Image} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import type {FileObject} from '@components/AttachmentModal';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import type {SetTestReceipt} from './types';

const setTestReceipt: SetTestReceipt = (asset, assetExtension, onFileRead) => {
    try {
        const filename = `${CONST.TEST_RECEIPT.FILENAME}_${Date.now()}.${assetExtension}`;
        const path = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${filename}`;
        const source = Image.resolveAssetSource(asset).uri;

        ReactNativeBlobUtil.config({
            fileCache: true,
            appendExt: assetExtension,
            path,
        })
            .fetch('GET', source)
            .then(() => {
                const file: FileObject = {
                    uri: `file://${path}`,
                    name: filename,
                    type: CONST.TEST_RECEIPT.FILE_TYPE,
                    size: 0,
                };

                if (!file.uri) {
                    Log.warn('Error reading test receipt');
                    return;
                }

                onFileRead(file.uri, file, filename);
            })
            .catch((error) => {
                Log.warn('Error reading test receipt:', {message: error});
            });
    } catch (error) {
        Log.warn('Error in setTestReceipt:', {message: error});
    }
};

export default setTestReceipt;
