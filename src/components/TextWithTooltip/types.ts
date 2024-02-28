import type {StyleProp, TextStyle} from 'react-native';

type TextWithTooltipProps = {
    /** The text to display */
    text: string;

    /** Whether to show the toolip text */
    shouldShowTooltip: boolean;

    /** Additional text styles */
    textStyles?: StyleProp<TextStyle>;

    /** Custom number of lines for text wrapping */
    numberOfLines?: number;
};

export default TextWithTooltipProps;
