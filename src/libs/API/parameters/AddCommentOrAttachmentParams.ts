import type {FileObject} from '@src/types/utils/Attachment';

type AddCommentOrAttachmentParams = {
    reportID: string;
    reportActionID?: string;
    commentReportActionID?: string | null;
    reportComment?: string;
    attachmentID?: string;
    file?: FileObject;
    timezone?: string;
    clientCreatedTime?: string;
    isOldDotConciergeChat?: boolean;
    idempotencyKey?: string;
    pageHTML?: string;
    optimisticConciergeReportActionID?: string;
    pregeneratedResponse?: string;
    sidePanelContext?: string;
};

export default AddCommentOrAttachmentParams;
