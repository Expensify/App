type NestedNumberArray = number | NestedNumberArray[];

type Attachment = {
    attachmentID?: string;

    localSource?: NestedNumberArray[];

    localSourceType?: string;

    remoteSource?: string;
};

export default Attachment;
