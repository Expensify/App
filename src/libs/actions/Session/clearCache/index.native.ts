import {CachesDirectoryPath, readDir, unlink} from 'react-native-fs';
import type ClearCache from './types';

// `unlink` is used to delete contents of the caches directory
const clearStorage: ClearCache = async () => {
    const files = await readDir(CachesDirectoryPath);
    const deletionPromises = files.map((file) => unlink(file.path));

    await Promise.all(deletionPromises);
};

export default clearStorage;
