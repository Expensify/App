import type {StyleProp, TextStyle, ViewStyle} from 'react-native';

type TextInputMeasurementProps = {
    /** The value to measure */
    value?: string;

    /** The placeholder to measure */
    placeholder?: string;

    /** The width to measure */
    contentWidth?: number;

    /** Whether to auto grow height */
    autoGrowHeight?: boolean;

    /** The maximum height for auto grow */
    maxAutoGrowHeight?: number;

    /** The width of the container */
    width: number | null;

    /** The input style */
    inputStyle?: StyleProp<TextStyle>;

    /** The input padding left */
    inputPaddingLeft?: StyleProp<ViewStyle>;

    /** Whether to auto grow */
    autoGrow?: boolean;

    /** Whether the input is markdown */
    isAutoGrowHeightMarkdown?: boolean;

    /** Callback to set the text input width */
    onSetTextInputWidth: (width: number) => void;

    /** Callback to set the text input height */
    onSetTextInputHeight: (height: number) => void;

    /** Whether the prefix character padding is calculated */
    isPrefixCharacterPaddingCalculated: boolean;

    /** Styles from container that need to be manually applied to hidden input (padding, border, etc.) since absolute positioning breaks inheritance */
    hiddenInputStyle?: StyleProp<TextStyle>;
};

export default TextInputMeasurementProps;
