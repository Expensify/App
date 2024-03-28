// eslint-disable-next-line no-restricted-imports
import type {CSSProperties} from 'react';
import type {GestureResponderEvent, StyleProp, TextStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

type PDFViewBaseProps = {
    /** URL to full-sized image */
    sourceURL: string;

    /** PDF file name */
    fileName?: string;

    /** (web only) Additional style props */
    style?: CSSProperties;

    /** Notify parent that the keyboard has opened or closed */
    onToggleKeyboard?: (isKeyboardOpen: boolean) => void;

    /** Handles press events like toggling attachment arrows natively */
    onPress?: (event?: GestureResponderEvent | KeyboardEvent | undefined) => void | Promise<void>;

    /** Handles scale changed event in PDF component */
    onScaleChanged?: (newScale: number) => void;

    /** Handles load complete event in PDF component */
    onLoadComplete: (path: string) => void;

    /** Should focus to the password input  */
    isFocused?: boolean;

    /** Styles for the error label */
    errorLabelStyles: StyleProp<TextStyle>;
};

type PDFViewOnyxProps = {
    maxCanvasArea: OnyxEntry<number>;
    maxCanvasHeight: OnyxEntry<number>;
    maxCanvasWidth: OnyxEntry<number>;
};

type PDFViewProps = PDFViewBaseProps & PDFViewOnyxProps;

type PDFViewNativeProps = PDFViewBaseProps & {
    onPress?: (page: number, x: number, y: number) => void;
};

export type {PDFViewNativeProps, PDFViewProps, PDFViewOnyxProps};
