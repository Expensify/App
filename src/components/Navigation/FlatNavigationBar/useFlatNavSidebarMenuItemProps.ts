import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';

import type {ViewStyle} from 'react-native';

import useShouldUseFlatNavigationBar from './useShouldUseFlatNavigationBar';

type FlatNavSidebarMenuItemProps = {
    /** Regular weight for rows that are not selected, matching the flat navigation bar's labels */
    shouldShowBasicTitle?: boolean;

    /** Selected row background, the same one the flat navigation bar's selected row uses */
    wrapperStyle?: ViewStyle;
};

/**
 * Gives the rows of a sidebar menu (Workspaces, Settings) the look of the flat navigation bar's rows
 * when the bar is shown, and no overrides otherwise.
 */
function useFlatNavSidebarMenuItemProps() {
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const shouldUseFlatNavigationBar = useShouldUseFlatNavigationBar();

    return (isFocused: boolean): FlatNavSidebarMenuItemProps => {
        if (!shouldUseFlatNavigationBar) {
            return {};
        }
        return {
            shouldShowBasicTitle: !isFocused,
            wrapperStyle: isFocused ? StyleUtils.getBackgroundColorStyle(theme.hoverComponentBG) : undefined,
        };
    };
}

export default useFlatNavSidebarMenuItemProps;
