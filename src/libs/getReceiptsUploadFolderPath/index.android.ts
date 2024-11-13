import ReactNativeBlobUtil from 'react-native-blob-util';
import CONST from '@src/CONST';
import type GetReceiptsUploadFolderPath from './types';

const getReceiptsUploadFolderPath: GetReceiptsUploadFolderPath = () => `${ReactNativeBlobUtil.fs.dirs.DownloadDir}${CONST.RECEIPTS_UPLOAD_PATH}`;

export default getReceiptsUploadFolderPath;
