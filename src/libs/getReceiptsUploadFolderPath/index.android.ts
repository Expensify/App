import RNFetchBlob from 'react-native-blob-util';
import CONST from '@src/CONST';
import type GetReceiptsUploadFolderPath from './types';

const getReceiptsUploadFolderPath: GetReceiptsUploadFolderPath = () => `${RNFetchBlob.fs.dirs.DownloadDir}${CONST.RECEIPTS_UPLOAD_PATH}`;

export default getReceiptsUploadFolderPath;
