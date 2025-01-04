import type * as OnyxCommon from './OnyxCommon';

type Attachment = OnyxCommon.OnyxValueWithOfflineFeedback<{
    attachmentID: string;

    localSource?: string;

    cachedSource?: string;

    source?: string;
}>;

export default Attachment;
