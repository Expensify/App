import {CachesDirectoryPath, readDir, unlink} from 'react-native-fs';
import Log from '@libs/Log';
import type ClearCache from './types';

// `unlink` is used to delete contents of the caches directory
const clearStorage: ClearCache = async () => {
    // iOS restricts deletion of the entire caches directory, requiring us to individually remove its contents
    // For additional context, see: https://github.com/Expensify/App/pull/75894
    const files = await readDir(CachesDirectoryPath);
    const results = await Promise.allSettled(files.map((file) => unlink(file.path)));

    for (const [index, result] of results.entries()) {
        if (result.status === 'fulfilled') {
            continue;
        }

        const fileName = files.at(index)?.path ?? 'unknown path';
        Log.warn(`Failed to delete cache file: ${fileName}`, String(result.reason));
    }
};

export default clearStorage;
