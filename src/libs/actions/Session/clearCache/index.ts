import {clearAuthImagesCache} from '@hooks/useCachedImageSource';
import type ClearCache from './types';

const clearStorage: ClearCache = async () => {
    await clearAuthImagesCache();
};

export default clearStorage;
