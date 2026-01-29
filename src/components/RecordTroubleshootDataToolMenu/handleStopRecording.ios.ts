import RNFS from 'react-native-fs';
import Log from '@libs/Log';
import finalizeStopRecording from './finalizeStopRecording';
import type StopRecordingParams from './handleStopRecording.types';

export default async function handleStopRecording({
    profilingData,
    infoFileName,
    profileFileName,
    appInfo,
    onDisableRecording,
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
        const message = error instanceof Error ? error.message : String(error);
        Log.hmmm('[ProfilingToolMenu] error checking/deleting existing file: ', message);
    }

    try {
        await RNFS.copyFile(profilePath, newFilePath);
        await finalizeStopRecording({
            infoFileName,
            appInfo,
            onDisableRecording,
            cleanupAfterDisable,
            zipRef,
            onDownloadZip,
        });

        setProfileTracePath?.(newFilePath);
        Log.hmmm('[ProfilingToolMenu] file copied successfully');
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        Log.hmmm('[ProfilingToolMenu] error copying file: ', message);
    }
}
