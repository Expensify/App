import type {StopRecordingParams} from './handleStopRecording.types';

export default function handleStopRecording({
    infoFileName,
    appInfo,
    logsWithParsedMessages,
    onDisableLogging,
    cleanupAfterDisable,
    zipRef,
    onDownloadZip,
}: StopRecordingParams): Promise<void> {
    zipRef.current?.file(infoFileName, appInfo);

    return onDisableLogging(logsWithParsedMessages).then(() => {
        cleanupAfterDisable();
        onDownloadZip?.();
    });
}
