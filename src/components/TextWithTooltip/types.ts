import type {StyleProp, TextStyle} from 'react-native';

type TextWithTooltipProps = {
    /** The text to display */
    text: string;

    /** Whether to show the tooltip text */
    shouldShowTooltip?: boolean;

    /** Additional styles */
    style?: StyleProp<TextStyle>;

    /** Custom number of lines for text wrapping */
    numberOfLines?: number;
};

export default TextWithTooltipProps;
