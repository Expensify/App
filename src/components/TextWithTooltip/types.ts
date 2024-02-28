import type {StyleProp, TextStyle} from 'react-native';

type TextWithTooltipProps = {
    text: string;
    shouldShowTooltip: boolean;
    textStyles?: StyleProp<TextStyle>;

    /** Custom number of lines for Text */
    numberOfLines?: number;
};

export default TextWithTooltipProps;
