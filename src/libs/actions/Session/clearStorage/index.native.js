import {CachesDirectoryPath, DocumentDirectoryPath, unlink} from 'react-native-fs';
import Log from '../../../Log';

function clearStorage () {
    return Promise.all(
        unlink(DocumentDirectoryPath).catch(Log.debug), 
        unlink(CachesDirectoryPath).catch(Log.debug)
    );
}

export default clearStorage;