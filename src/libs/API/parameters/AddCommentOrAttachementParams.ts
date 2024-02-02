import type {FileObject} from '@components/AttachmentModal';

type AddCommentOrAttachementParams = {
    reportID: string;
    reportActionID?: string;
    commentReportActionID?: string | null;
    reportComment?: string;
    file?: Partial<FileObject>;
    timezone?: string;
    shouldAllowActionableMentionWhispers?: boolean;
    clientCreatedTime?: string;
    isOldDotConciergeChat?: boolean;
};

export default AddCommentOrAttachementParams;
