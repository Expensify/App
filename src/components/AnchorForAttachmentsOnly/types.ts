import type {StyleProp, ViewStyle} from 'react-native';

type AnchorForAttachmentsOnlyProps = {
    /** The URL of the attachment */
    source?: string;

    /** Filename for attachments. */
    displayName?: string;

    /** Any additional styles to apply */
    style?: StyleProp<ViewStyle>;

    /** Whether the attachment is deleted */
    isDeleted?: boolean;
};

export default AnchorForAttachmentsOnlyProps;
