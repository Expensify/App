import type {FileObject} from '@components/AttachmentModal';

type AddCommentOrAttachementParams = {
    attachmentID?: string;
    attachmentVersion?: string;
    reportID: string;
    reportActionID?: string;
    commentReportActionID?: string | null;
    reportComment?: string;
    file?: FileObject;
    files?: {
        file: FileObject;
        attachmentID: string;
    }[];
    timezone?: string;
    clientCreatedTime?: string;
    isOldDotConciergeChat?: boolean;
    idempotencyKey?: string;
};

export default AddCommentOrAttachementParams;
