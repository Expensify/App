import type {ForwardedFSClassProps} from '@libs/Fullstory/types';

import type {StyleProp, TextStyle} from 'react-native';

type TextWithTooltipProps = ForwardedFSClassProps & {
    /** The text to display */
    text: string;

    /** Whether to show the tooltip text */
    shouldShowTooltip?: boolean;

    /** Additional styles */
    style?: StyleProp<TextStyle>;

    /** Custom number of lines for text wrapping */
    numberOfLines?: number;

    /** TestID of the Text component */
    testID?: string;

    /** Whether this value should be directly selectable/copyable inside pressable rows */
    isCopyable?: boolean;
};

export default TextWithTooltipProps;
