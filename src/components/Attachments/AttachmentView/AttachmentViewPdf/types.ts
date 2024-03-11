import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';
import type {AttachmentFile} from '@components/Attachments/types';

type AttachmentViewPdfProps = {
    encryptedSourceUrl: string;
    onToggleKeyboard?: (shouldFadeOut: boolean) => void;
    onLoadComplete: (path: string) => void;

    file?: AttachmentFile;

    /** Additional style props */
    style?: StyleProp<ViewStyle>;

    /** Styles for the error label */
    errorLabelStyles?: StyleProp<ViewStyle>;

    /** Whether this view is the active screen  */
    isFocused?: boolean;

    onPress?: (e?: GestureResponderEvent | KeyboardEvent) => void;
};

export default AttachmentViewPdfProps;
