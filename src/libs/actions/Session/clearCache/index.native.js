import {CachesDirectoryPath, unlink} from 'react-native-fs';

function clearStorage() {
    return unlink(CachesDirectoryPath);
}

export default clearStorage;
