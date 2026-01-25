import RNFetchBlob from 'react-native-blob-util';
import finalizeStopRecording from './finalizeStopRecording';
import type StopRecordingParams from './handleStopRecording.types';

export default async function handleStopRecording({
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
        try {
            // Check if it is an internal path of `DownloadManager` then append content://media to create a valid url
            const {path} = await RNFetchBlob.fs.stat(!profilePath.startsWith('content://media/') && profilePath.match(/\/downloads\/\d+$/) ? `content://media/${profilePath}` : profilePath);
            setProfileTracePath?.(path);
        } catch {
            setProfileTracePath?.(profilePath);
        }
    }

    await finalizeStopRecording({
        infoFileName,
        appInfo,
        logsWithParsedMessages,
        onDisableLogging,
        cleanupAfterDisable,
        zipRef,
        onDownloadZip,
    });
}
