import type {StyleProp, ViewStyle} from 'react-native';
import type {AttachmentViewProps} from '..';

type AttachmentViewPdfProps = Pick<AttachmentViewProps, 'file' | 'onPress' | 'isUsedInCarousel' | 'isFocused' | 'onToggleKeyboard'> & {
    encryptedSourceUrl: string;
    onLoadComplete: (path: string) => void;

    /** Additional style props */
    style?: StyleProp<ViewStyle>;

    /** Styles for the error label */
    errorLabelStyles?: StyleProp<ViewStyle>;

    /** Triggered when the PDF's onScaleChanged event is triggered */
    onScaleChanged?: (scale: number) => void;
};

export default AttachmentViewPdfProps;
