import RNFetchBlob from 'react-native-blob-util';
import type {StopRecordingParams} from './handleStopRecording.types';

export default function handleStopRecording({
    profilingData,
    infoFileName,
    appInfo,
    logsWithParsedMessages,
    onDisableLogging,
    cleanupAfterDisable,
    zipRef,
    onDownloadZip,
    setProfileTracePath,
}: StopRecordingParams): Promise<void> {
    const {profilePath} = profilingData;

    if (profilePath) {
        RNFetchBlob.fs
            // Check if it is an internal path of `DownloadManager` then append content://media to create a valid url
            .stat(!profilePath.startsWith('content://media/') && profilePath.match(/\/downloads\/\d+$/) ? `content://media/${profilePath}` : profilePath)
            .then(({path}) => setProfileTracePath?.(path))
            .catch(() => setProfileTracePath?.(profilePath));
    }

    zipRef.current?.file(infoFileName, appInfo);

    return onDisableLogging(logsWithParsedMessages).then(() => {
        cleanupAfterDisable();
        onDownloadZip?.();
    });
}
