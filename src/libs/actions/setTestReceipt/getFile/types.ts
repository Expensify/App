import type {FetchBlobResponse} from 'react-native-blob-util';
import type {AssetExtension} from '@userActions/setTestReceipt/types';

type GetFile = (source: string, path: string, assetExtension: AssetExtension) => Promise<FetchBlobResponse | void>;

export default GetFile;
