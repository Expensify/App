import type JSZip from 'jszip';
import type {RefObject} from 'react';
import type {ProfilingData} from '@libs/actions/Troubleshoot';
import type {Log as OnyxLog} from '@src/types/onyx';

type StopRecordingParams = {
    profilingData: ProfilingData;
    infoFileName: string;
    profileFileName: string;
    appInfo: string;
    logsWithParsedMessages: OnyxLog[];
    onDisableLogging: (logs: OnyxLog[]) => Promise<void>;
    cleanupAfterDisable: () => void;
    zipRef: RefObject<InstanceType<typeof JSZip>>;
    pathToBeUsed: string;
    onDownloadZip?: () => void;
    setProfileTracePath?: (path: string) => void;
};

export default StopRecordingParams;
