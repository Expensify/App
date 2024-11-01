import type {StyleProp, ViewStyle} from 'react-native';
import type {AttachmentViewProps} from '..';

type AttachmentViewPdfProps = Pick<AttachmentViewProps, 'file' | 'onPress' | 'isFocused' | 'onToggleKeyboard'> & {
    encryptedSourceUrl: string;
    onLoadComplete: (path: string) => void;

    /** Additional style props */
    style?: StyleProp<ViewStyle>;

    /** Triggered when the PDF's onScaleChanged event is triggered */
    onScaleChanged?: (scale: number) => void;

    /** Triggered when the PDF fails to load */
    onLoadError?: () => void;

    /** Whether the PDF is used as a chat attachment */
    isUsedAsChatAttachment?: boolean;
};

export default AttachmentViewPdfProps;
