import type {StyleProp, ViewStyle} from 'react-native';

type AnchorForAttachmentsOnlyProps = {
    /** The URL of the attachment */
    source?: string;

    /** Filename for attachments. */
    displayName?: string;

    style?: StyleProp<ViewStyle>;
    isDeleted?: boolean;
};

export default AnchorForAttachmentsOnlyProps;
