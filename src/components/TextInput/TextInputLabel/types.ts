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

    /** Force the floating label to render on a single line and ellipsize even when the input is multiline */
    shouldLabelStayOnSingleLine?: boolean;

    /** For attribute for label */
    for?: string;
};

export default TextInputLabelProps;
