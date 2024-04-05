import type {GestureResponderEvent, StyleProp, TextStyle, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

type PDFViewBaseProps = {
    /** URL to full-sized image */
    sourceURL: string;

    /** PDF file name */
    fileName?: string;

    /** Additional style props */
    style?: StyleProp<ViewStyle>;

    /** Notify parent that the keyboard has opened or closed */
    onToggleKeyboard?: (isKeyboardOpen: boolean) => void;

    /** Handles press events like toggling attachment arrows natively */
    onPress?: (event?: GestureResponderEvent | KeyboardEvent) => void;

    /** Handles scale changed event in PDF component */
    onScaleChanged?: (newScale: number) => void;

    /** Handles load complete event in PDF component */
    onLoadComplete: (path: string) => void;

    /** Should focus to the password input  */
    isFocused?: boolean;

    /** Styles for the error label */
    errorLabelStyles?: StyleProp<TextStyle>;
};

type PDFViewOnyxProps = {
    // Maximum canvas area to render the PDF preview
    maxCanvasArea: OnyxEntry<number>;

    // Maximum canvas height to render the PDF preview
    maxCanvasHeight: OnyxEntry<number>;

    // Maximum canvas width to render the PDF preview
    maxCanvasWidth: OnyxEntry<number>;
};

type PDFViewProps = PDFViewBaseProps & PDFViewOnyxProps;

type PDFViewNativeProps = PDFViewBaseProps & {
    onPress?: (page: number, x: number, y: number) => void;
};

export type {PDFViewNativeProps, PDFViewProps, PDFViewOnyxProps};
