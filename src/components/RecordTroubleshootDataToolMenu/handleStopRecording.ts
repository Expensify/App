import finalizeStopRecording from './finalizeStopRecording';
import type StopRecordingParams from './handleStopRecording.types';

type HandleStopRecording = (params: StopRecordingParams) => Promise<void>;

const handleStopRecording: HandleStopRecording = ({infoFileName, appInfo, logsWithParsedMessages, onDisableLogging, cleanupAfterDisable, zipRef, onDownloadZip}) =>
    finalizeStopRecording({
        infoFileName,
        appInfo,
        logsWithParsedMessages,
        onDisableLogging,
        cleanupAfterDisable,
        zipRef,
        onDownloadZip,
    });

export default handleStopRecording;
