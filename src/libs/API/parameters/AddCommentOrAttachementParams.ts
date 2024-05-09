import type {FileObject} from '@components/AttachmentModal';

type AddCommentOrAttachementParams = {
    reportID: string;
    reportActionID?: string;
    commentReportActionID?: string | null;
    reportComment?: string;
    file?: FileObject;
    timezone?: string;
    clientCreatedTime?: string;
    isOldDotConciergeChat?: boolean;
};

export default AddCommentOrAttachementParams;
