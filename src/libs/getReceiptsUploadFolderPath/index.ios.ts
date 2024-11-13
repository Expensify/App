import ReactNativeBlobUtil from 'react-native-blob-util';
import CONST from '@src/CONST';
import type GetReceiptsUploadFolderPath from './types';

const getReceiptsUploadFolderPath: GetReceiptsUploadFolderPath = () => `${ReactNativeBlobUtil.fs.dirs.DocumentDir}${CONST.RECEIPTS_UPLOAD_PATH}`;

export default getReceiptsUploadFolderPath;
