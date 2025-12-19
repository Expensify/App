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
    /** HTML representation of the page the user is viewing when sending from the Concierge side panel */
    pageHTML?: string;
};

export default AddCommentOrAttachmentParams;
