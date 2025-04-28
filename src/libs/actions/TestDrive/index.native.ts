import {Image} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import TestReceipt from '@assets/images/fake-test-drive-employee-receipt.jpg';
import type {FileObject} from '@components/AttachmentModal';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import type {SetTestDriveReceiptAndNavigate} from './types';

const setTestDriveReceiptAndNavigate: SetTestDriveReceiptAndNavigate = (filename, onFileCreation) => {
    try {
        const path = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${filename}`;
        const source = Image.resolveAssetSource(TestReceipt).uri;

        ReactNativeBlobUtil.config({
            fileCache: true,
            appendExt: 'png',
            path,
        })
            .fetch('GET', source)
            .then(() => {
                const file: FileObject = {
                    uri: `file://${path}`,
                    name: filename,
                    type: CONST.TEST_DRIVE.EMPLOYEE_FAKE_RECEIPT.FILE_TYPE,
                    size: 0,
                };

                if (!file.uri) {
                    Log.warn('Error reading test receipt');
                    return;
                }

                onFileCreation(file.uri);
            })
            .catch((error) => {
                Log.warn('Error reading test receipt:', {message: error});
            });
    } catch (error) {
        Log.warn('Error in setTestDriveReceiptAndNavigate:', {message: error});
    }
};

// eslint-disable-next-line import/prefer-default-export
export {setTestDriveReceiptAndNavigate};
