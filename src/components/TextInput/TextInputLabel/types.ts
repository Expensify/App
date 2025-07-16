import type {SharedValue} from 'react-native-reanimated';

type TextInputLabelProps = {
    /** Label */
    label: string;

    /** Label vertical translate */
    labelTranslateY: SharedValue<number>;

    /** Label scale */
    labelScale: SharedValue<number>;

    /** Whether the input is multiline */
    isMultiline?: boolean;

    /** For attribute for label */
    for?: string;
};

export default TextInputLabelProps;
