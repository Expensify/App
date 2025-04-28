export type UploadAttachmentProps = {
    attachmentID: string;
    url: string;
};
export type FetchFileProps = {
    url?: string;
    file?: File;
};
export type CacheAttachmentProps = {
    attachmentID: string;
    url: string;
    file?: File;
};
