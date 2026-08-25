import type {SharedValue} from 'react-native-reanimated';

type TextInputLabelProps = {
    label: string;

    /** Label vertical translate */
    labelTranslateY: SharedValue<number>;

    labelScale: SharedValue<number>;

    isMultiline?: boolean;

    /** Force the floating label to render on a single line and ellipsize even when the input is multiline */
    shouldLabelStayOnSingleLine?: boolean;

    /** For attribute for label */
    for?: string;
};

export default TextInputLabelProps;
