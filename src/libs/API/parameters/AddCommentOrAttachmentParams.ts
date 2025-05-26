import type {FileObject} from '@components/AttachmentModal';

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
};

export default AddCommentOrAttachmentParams;
