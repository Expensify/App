import {readFileAsync} from '@libs/fileDownload/FileUtils';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import type {SetTestReceipt} from './types';

const setTestReceipt: SetTestReceipt = (asset, assetExtension, onFileRead, onFileError) => {
    const filename = `${CONST.TEST_RECEIPT.FILENAME}_${Date.now()}.${assetExtension}`;
    readFileAsync(
        asset as string,
        filename,
        (file) => {
            const source = URL.createObjectURL(file);

            onFileRead(source, file, filename);
        },
        (error) => {
            Log.warn('Error reading test receipt:', {message: error});

            onFileError?.(error);
        },
        CONST.TEST_RECEIPT.FILE_TYPE,
    );
};

export default setTestReceipt;
