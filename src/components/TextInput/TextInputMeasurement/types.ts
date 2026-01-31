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

    /** Horizontal padding and border styles extracted from the container for accurate width measurement */
    textInputMeasurementStyles?: StyleProp<TextStyle>;

    /** Callback to set the text input width */
    onSetTextInputWidth: (width: number) => void;

    /** Callback to set the text input height */
    onSetTextInputHeight: (height: number) => void;

    /** Whether the prefix character padding is calculated */
    isPrefixCharacterPaddingCalculated: boolean;
};

export default TextInputMeasurementProps;
