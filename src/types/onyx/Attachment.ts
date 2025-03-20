import type * as OnyxCommon from './OnyxCommon';

type Attachment = OnyxCommon.OnyxValueWithOfflineFeedback<{
    attachmentID?: string;

    localSource?: string | Uint8Array;

    remoteSource?: string;
}>;

export default Attachment;
