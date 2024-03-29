import {CachesDirectoryPath, unlink} from 'react-native-fs';
import type ClearCache from './types';

// `unlink` is used to delete the caches directory
const clearStorage: ClearCache = () => unlink(CachesDirectoryPath);

export default clearStorage;
