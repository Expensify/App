import type {FileObject} from '@src/types/utils/Attachment';

type AddCommentOrAttachmentParams = {
    reportID: string;
    reportActionID?: string;
    commentReportActionID?: string | null;
    reportComment?: string;
    file?: FileObject;
    timezone?: string;
    clientCreatedTime?: string;
    isOldDotConciergeChat?: boolean;
    idempotencyKey?: string;
    /** Simplified HTML of the page the user is viewing when sending from the Concierge side panel */
    simplifiedPageHTML?: string;
};

export default AddCommentOrAttachmentParams;
