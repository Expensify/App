import type {SharedValue} from 'react-native-reanimated';

type TextInputLabelProps = {
    /** Label */
    label: string;

    /** Label vertical translate */
    labelTranslateY: SharedValue<number>;

    /** Label scale */
    labelScale: SharedValue<number>;

    /** For attribute for label */
    for?: string;
};

export default TextInputLabelProps;
