import {Image} from 'react-native';
import type {Asset, AssetExtension} from '@userActions/setTestReceipt/types';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';

function getFileURL(asset: Asset, assetExtension: AssetExtension) {
    const source = Image.resolveAssetSource(asset).uri;
    return CONFIG.ENVIRONMENT === CONST.ENVIRONMENT.DEV ? source : `file:///android_res/drawable/${source}.${assetExtension}`;
}

export default getFileURL;
