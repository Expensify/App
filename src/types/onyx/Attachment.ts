import type * as OnyxCommon from './OnyxCommon';

type Attachment = OnyxCommon.OnyxValueWithOfflineFeedback<{
    attachmentID?: string;

    localSource?: string;

    localVersion?: string;

    remoteVersion?: string;

    source?: string;
}>;

export default Attachment;
