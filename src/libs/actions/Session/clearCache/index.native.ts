import {CachesDirectoryPath, readDir, unlink} from 'react-native-fs';
import type ClearCache from './types';

// `unlink` is used to delete contents of the caches directory
const clearStorage: ClearCache = async () => {
    // // iOS restricts deletion of the entire caches directory, requiring us to individually remove its contents
    // For additional context, see: https://github.com/Expensify/App/pull/75894
    const files = await readDir(CachesDirectoryPath);
    const deletionPromises = files.map((file) => unlink(file.path));

    await Promise.all(deletionPromises);
};

export default clearStorage;
