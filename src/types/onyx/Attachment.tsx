type Attachment = {
    /** Attachment ID of the attachment */
    attachmentID: string;

    /** Source url of the attachment either can be local or remote url */
    source?: string;

    /** Remote source url of the attachment */
    remoteSource?: string;
};

export default Attachment;
