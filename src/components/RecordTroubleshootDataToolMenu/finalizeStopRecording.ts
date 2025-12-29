import type StopRecordingParams from './handleStopRecording.types';

type FinalizeStopRecordingParams = Pick<StopRecordingParams, 'infoFileName' | 'appInfo' | 'logsWithParsedMessages' | 'onDisableLogging' | 'cleanupAfterDisable' | 'zipRef' | 'onDownloadZip'>;

export default async function finalizeStopRecording({
    infoFileName,
    appInfo,
    logsWithParsedMessages,
    onDisableLogging,
    cleanupAfterDisable,
    zipRef,
    onDownloadZip,
}: FinalizeStopRecordingParams): Promise<void> {
    zipRef.current?.file(infoFileName, appInfo);

    await onDisableLogging(logsWithParsedMessages);
    cleanupAfterDisable();
    onDownloadZip?.();
}
