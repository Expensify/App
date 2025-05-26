import {Image} from 'react-native';
import type {Asset} from '@userActions/setTestReceipt/types';

function getFileURL(asset: Asset) {
    return Image.resolveAssetSource(asset).uri;
}

export default getFileURL;
