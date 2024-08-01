import type {Animated} from 'react-native';

type TextInputLabelProps = {
    /** Label */
    label: string;

    /** Label vertical translate */
    labelTranslateY: Animated.Value;

    /** Label scale */
    labelScale: Animated.Value;

    /** Whether the label is currently active or not */
    isLabelActive: boolean;

    /** For attribute for label */
    for?: string;
};

export default TextInputLabelProps;
