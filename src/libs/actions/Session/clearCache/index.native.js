import {CachesDirectoryPath, unlink} from 'react-native-fs';

function clearStorage() {
    // `unlink` is used to delete the caches directory
    return unlink(CachesDirectoryPath);
}

export default clearStorage;
