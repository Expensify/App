import type {StyleProp, TextStyle, ViewStyle} from 'react-native';

type TextInputMeasurementProps = {
    /** The value to measure */
    value?: string;

    /** The placeholder to measure */
    placeholder?: string;

    /** The width to measure */
    contentWidth?: number;

    autoGrowHeight?: boolean;
    maxAutoGrowHeight?: number;

    /** The width of the container */
    width: number | null;

    inputStyle?: StyleProp<TextStyle>;
    inputPaddingLeft?: StyleProp<ViewStyle>;
    autoGrow?: boolean;
    isAutoGrowHeightMarkdown?: boolean;

    /** Horizontal padding and border styles extracted from the container for accurate width measurement */
    autoGrowMeasurementStyles?: StyleProp<TextStyle>;

    onSetTextInputWidth: (width: number) => void;
    onSetTextInputHeight: (height: number) => void;
    isPrefixCharacterPaddingCalculated: boolean;
};

export default TextInputMeasurementProps;
