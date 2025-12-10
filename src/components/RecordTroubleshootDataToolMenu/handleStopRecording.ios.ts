import RNFS from 'react-native-fs';
import Log from '@libs/Log';
import type {StopRecordingParams} from './handleStopRecording.types';

export default async function handleStopRecording({
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
        return;
    }

    const newFilePath = `${pathToBeUsed}/${profileFileName}`;

    try {
        const fileExists = await RNFS.exists(newFilePath);
        if (fileExists) {
            await RNFS.unlink(newFilePath);
            Log.hmmm('[ProfilingToolMenu] existing file deleted successfully');
        }
    } catch (error) {
        const typedError = error as Error;
        Log.hmmm('[ProfilingToolMenu] error checking/deleting existing file: ', typedError.message);
    }

    try {
        await RNFS.copyFile(profilePath, newFilePath);
        zipRef.current?.file(infoFileName, appInfo);

        await onDisableLogging(logsWithParsedMessages);
        cleanupAfterDisable();
        onDownloadZip?.();

        setProfileTracePath?.(newFilePath);
        Log.hmmm('[ProfilingToolMenu] file copied successfully');
    } catch (error) {
        Log.hmmm('[ProfilingToolMenu] error copying file: ', error);
    }
}
