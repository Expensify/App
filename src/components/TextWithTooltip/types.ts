import type {StyleProp, TextStyle} from 'react-native';

type TextWithTooltipProps = {
    text: string;
    shouldShowTooltip: boolean;
    textStyles?: StyleProp<TextStyle>;
};

export default TextWithTooltipProps;
