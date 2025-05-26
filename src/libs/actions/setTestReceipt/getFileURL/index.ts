import {Image} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import type {Asset, AssetExtension} from '@userActions/setTestReceipt/types';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';

function getFileURL(asset: Asset, assetExtension: AssetExtension) {
    const source = Image.resolveAssetSource(asset).uri;
    return CONFIG.ENVIRONMENT === CONST.ENVIRONMENT.DEV ? source : ReactNativeBlobUtil.fs.asset(`${source}.${assetExtension}`);
}

export default getFileURL;
