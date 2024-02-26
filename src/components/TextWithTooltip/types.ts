import type {StyleProp, TextStyle} from 'react-native';

type TextWithTooltipProps = {
    text: string;
    shouldShowTooltip: boolean;
    style?: StyleProp<TextStyle>;
};

export default TextWithTooltipProps;
