import AttachmentProps from '@components/Attachments/AttachmentView/types';

type AttachmentViewImageProps = {
    loadComplete: boolean;
    isImage: boolean;
    onError: () => void;
} & AttachmentProps;

export default AttachmentViewImageProps;
