import {StyleProp, ViewStyle} from 'react-native';
import AttachmentProps from '@components/Attachments/AttachmentView/types';

type AttachmentViewPdfProps = {
    encryptedSourceUrl: string;
    onToggleKeyboard: () => void;
    onLoadComplete: () => void;

    /** Additional style props */
    style: StyleProp<ViewStyle>;

    /** Styles for the error label */
    errorLabelStyles: StyleProp<ViewStyle>;
} & AttachmentProps;

export default AttachmentViewPdfProps;
