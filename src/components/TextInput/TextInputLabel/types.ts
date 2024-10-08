import type {Animated} from 'react-native';

type TextInputLabelProps = {
    /** Label */
    label: string;

    /** Label vertical translate */
    labelTranslateY: Animated.Value;

    /** Label scale */
    labelScale: Animated.Value;

    /** For attribute for label */
    for?: string;
};

export default TextInputLabelProps;
