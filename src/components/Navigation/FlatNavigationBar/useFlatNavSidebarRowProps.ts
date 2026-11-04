import useThemeStyles from '@hooks/useThemeStyles';

import type {ViewStyle} from 'react-native';

import useShouldUseFlatNavigationBar from './useShouldUseFlatNavigationBar';

type FlatNavSidebarRowProps = {
    /** Regular weight for rows that are not selected, matching the flat navigation bar's labels */
    shouldShowBasicTitle?: boolean;

    /** Background of the selected row, the one the flat navigation bar's selected row uses */
    selectedStyle?: ViewStyle;

    /** Background of a hovered row that is not selected, the one the flat navigation bar's hovered row uses */
    hoveredStyle?: ViewStyle;
};

/**
 * Gives the rows of a tab's sidebar (Inbox, Spend, Workspaces, Domains, Account) the look of the flat navigation bar's
 * rows when the bar is shown, and no overrides otherwise. The returned function takes whether the row is selected.
 */
function useFlatNavSidebarRowProps() {
    const styles = useThemeStyles();
    const shouldUseFlatNavigationBar = useShouldUseFlatNavigationBar();

    return (isSelected: boolean): FlatNavSidebarRowProps => {
        if (!shouldUseFlatNavigationBar) {
            return {};
        }
        return {
            shouldShowBasicTitle: !isSelected,
            selectedStyle: isSelected ? styles.flatNavigationBarItemSelected : undefined,
            hoveredStyle: styles.flatNavigationBarItemHovered,
        };
    };
}

export default useFlatNavSidebarRowProps;
export type {FlatNavSidebarRowProps};
