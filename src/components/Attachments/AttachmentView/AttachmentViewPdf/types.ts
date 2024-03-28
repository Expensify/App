// eslint-disable-next-line no-restricted-imports
import type {CSSProperties} from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import type {AttachmentViewProps} from '..';

type AttachmentViewPdfProps = Pick<AttachmentViewProps, 'file' | 'onPress' | 'isUsedInCarousel' | 'isFocused' | 'onToggleKeyboard'> & {
    encryptedSourceUrl: string;
    onLoadComplete: (path: string) => void;

    /** (web only) Additional style props */
    style?: CSSProperties;

    /** Styles for the error label */
    errorLabelStyles?: StyleProp<TextStyle>;

    /** Triggered when the PDF's onScaleChanged event is triggered */
    onScaleChanged?: (scale: number) => void;
};

export default AttachmentViewPdfProps;
