import type {ForwardedFSClassProps} from '@libs/Fullstory/types';

import type {StyleProp, TextStyle} from 'react-native';

type TextWithTooltipProps = ForwardedFSClassProps & {
    text: string;
    shouldShowTooltip?: boolean;
    style?: StyleProp<TextStyle>;

    /** Custom number of lines for text wrapping */
    numberOfLines?: number;

    testID?: string;

    /** Whether this value should be directly selectable/copyable inside pressable rows */
    isCopyable?: boolean;
};

export default TextWithTooltipProps;
