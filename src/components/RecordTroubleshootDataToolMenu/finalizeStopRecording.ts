import type StopRecordingParams from './handleStopRecording.types';

type FinalizeStopRecordingParams = Pick<StopRecordingParams, 'infoFileName' | 'appInfo' | 'onDisableRecording' | 'cleanupAfterDisable' | 'zipRef' | 'onDownloadZip'>;

export default async function finalizeStopRecording({
    infoFileName,
    appInfo,
    onDisableRecording,
    cleanupAfterDisable,
    zipRef,
    onDownloadZip,
}: FinalizeStopRecordingParams): Promise<void> {
    zipRef.current?.file(infoFileName, appInfo);

    await onDisableRecording();
    cleanupAfterDisable();
    onDownloadZip?.();
}
