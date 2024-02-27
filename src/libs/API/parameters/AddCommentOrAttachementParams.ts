type AddCommentOrAttachementParams = {
    reportID: string;
    reportActionID?: string;
    commentReportActionID?: string | null;
    reportComment?: string;
    file?: File;
    timezone?: string;
    clientCreatedTime?: string;
    isOldDotConciergeChat?: boolean;
};

export default AddCommentOrAttachementParams;
