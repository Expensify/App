import TestReceipt from '@assets/images/fake-test-drive-employee-receipt.jpg';
import {readFileAsync} from '@libs/fileDownload/FileUtils';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import type {SetTestDriveReceiptAndNavigate} from './types';

const setTestDriveReceiptAndNavigate: SetTestDriveReceiptAndNavigate = (filename, onFileCreation) => {
    try {
        readFileAsync(
            TestReceipt as string,
            filename,
            (file) => {
                const source = URL.createObjectURL(file);

                onFileCreation(source);
            },
            (error) => {
                Log.warn('Error reading test receipt:', {message: error});
            },
            CONST.TEST_DRIVE.EMPLOYEE_FAKE_RECEIPT.FILE_TYPE,
        );
    } catch (error) {
        Log.warn('Error in setTestDriveReceiptAndNavigate:', {message: error});
    }
};

// eslint-disable-next-line import/prefer-default-export
export {setTestDriveReceiptAndNavigate};
