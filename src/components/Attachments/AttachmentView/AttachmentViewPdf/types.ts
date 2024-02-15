import type {StyleProp, ViewStyle} from 'react-native';
import type AttachmentViewBaseProps from '@components/Attachments/AttachmentView/types';
import type {Attachment} from '@components/Attachments/types';

type AttachmentViewPdfProps = {
    encryptedSourceUrl: string;
    onToggleKeyboard?: () => void;
    onLoadComplete: () => void;

    /** Additional style props */
    style?: StyleProp<ViewStyle>;

    /** Styles for the error label */
    errorLabelStyles?: StyleProp<ViewStyle>;

    /** Whether this view is the active screen  */
    isFocused?: boolean;
} & AttachmentViewBaseProps &
    Attachment;

export default AttachmentViewPdfProps;
