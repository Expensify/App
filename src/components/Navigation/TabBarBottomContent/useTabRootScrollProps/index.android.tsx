import type {StyleProp, ViewStyle} from 'react-native';

import type TabRootScrollProps from './types';

/**
 * A tab root screen reserves the row of Material's bar below its content, with the offline indicator laid out above
 * it, so neither covers the list and the content container keeps its style.
 */
function useTabRootScrollProps(style?: StyleProp<ViewStyle>): TabRootScrollProps {
    return {contentContainerStyle: style};
}

export default useTabRootScrollProps;
