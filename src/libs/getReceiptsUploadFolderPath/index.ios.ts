import CONST from '@src/CONST';

import RNFetchBlob from 'react-native-blob-util';

import type GetReceiptsUploadFolderPath from './types';

// Queued receipts must survive until upload, so they live in Library/Application Support:
// it is persistent (unlike Caches, which the OS may purge) and never exposed to the user
// via the iOS Files app (unlike Documents)
const getReceiptsUploadFolderPath: GetReceiptsUploadFolderPath = () => `${RNFetchBlob.fs.dirs.LibraryDir}/Application Support${CONST.RECEIPTS_UPLOAD_PATH}`;

export default getReceiptsUploadFolderPath;
