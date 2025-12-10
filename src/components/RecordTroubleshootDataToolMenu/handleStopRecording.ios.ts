import RNFS from 'react-native-fs';
import Log from '@libs/Log';
import type {StopRecordingParams} from './handleStopRecording.types';

export default function handleStopRecording({
    profilingData,
    infoFileName,
    profileFileName,
    appInfo,
    logsWithParsedMessages,
    onDisableLogging,
    cleanupAfterDisable,
    zipRef,
    pathToBeUsed,
    onDownloadZip,
    setProfileTracePath,
}: StopRecordingParams): Promise<void> {
    const {profilePath} = profilingData;

    if (!profilePath) {
        cleanupAfterDisable();
        return Promise.resolve();
    }

    const newFilePath = `${pathToBeUsed}/${profileFileName}`;

    return RNFS.exists(newFilePath)
        .then((fileExists) => {
            if (!fileExists) {
                return;
            }

            return RNFS.unlink(newFilePath).then(() => {
                Log.hmmm('[ProfilingToolMenu] existing file deleted successfully');
            });
        })
        .catch((error) => {
            const typedError = error as Error;
            Log.hmmm('[ProfilingToolMenu] error checking/deleting existing file: ', typedError.message);
        })
        .then(() => RNFS.copyFile(profilePath, newFilePath))
        .then(() => {
            zipRef.current?.file(infoFileName, appInfo);

            return onDisableLogging(logsWithParsedMessages).then(() => {
                cleanupAfterDisable();
                onDownloadZip?.();
            });
        })
        .then(() => {
            setProfileTracePath?.(newFilePath);
            Log.hmmm('[ProfilingToolMenu] file copied successfully');
        })
        .catch((error) => {
            Log.hmmm('[ProfilingToolMenu] error copying file: ', error);
        });
}
