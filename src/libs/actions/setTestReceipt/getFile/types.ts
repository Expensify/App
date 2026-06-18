import type {AssetExtension} from '@userActions/setTestReceipt/types';

import type {FetchBlobResponse} from 'react-native-blob-util';

type GetFile = (source: string, path: string, assetExtension: AssetExtension) => Promise<FetchBlobResponse | void>;

export default GetFile;
