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

    /** Called with whether the label is cut off, whenever that may have changed. Web only, since there is no hover on native. */
    onTruncationChange?: (isTruncated: boolean) => void;
};

export default TextInputLabelProps;
