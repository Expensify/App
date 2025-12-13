import type StopRecordingParams from './handleStopRecording.types';

export default async function handleStopRecording({
    infoFileName,
    appInfo,
    logsWithParsedMessages,
    onDisableLogging,
    cleanupAfterDisable,
    zipRef,
    onDownloadZip,
}: StopRecordingParams): Promise<void> {
    zipRef.current?.file(infoFileName, appInfo);

    await onDisableLogging(logsWithParsedMessages);
    cleanupAfterDisable();
    onDownloadZip?.();
}
