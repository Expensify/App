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
    pageHTML?: string;
    optimisticConciergeReportActionID?: string;
    pregeneratedResponse?: string;
};

export default AddCommentOrAttachmentParams;
