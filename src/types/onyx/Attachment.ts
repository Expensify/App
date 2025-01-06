import type * as OnyxCommon from './OnyxCommon';

type Attachment = OnyxCommon.OnyxValueWithOfflineFeedback<{
    attachmentID: number;

    localSource?: string;

    localVersion?: number;

    cachedVersion?: number;

    remoteVersion?: number;

    cachedSource?: string;

    source?: string;
}>;

export default Attachment;
