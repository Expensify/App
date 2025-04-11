import type {FileObject} from '@pages/media/AttachmentModalScreen/types';

type AddCommentOrAttachementParams = {
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

export default AddCommentOrAttachementParams;
