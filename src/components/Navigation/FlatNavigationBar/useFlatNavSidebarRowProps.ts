/**
 * Gives the rows of a tab's sidebar the flat navigation bar's look when the bar is shown, and no overrides otherwise.
 */
import useThemeStyles from '@hooks/useThemeStyles';

import type {ThemeStyles} from '@styles/index';

import type {TextStyle, ViewStyle} from 'react-native';

import useShouldUseFlatNavigationBar from './useShouldUseFlatNavigationBar';

type FlatNavSidebarRowProps = {
    /** Regular weight for rows that are not selected, matching the flat navigation bar's labels */
    shouldShowBasicTitle?: boolean;

    /** Supporting text color for rows that are not selected, matching the flat navigation bar's labels */
    titleStyle?: TextStyle;

    /** Default text color while a row that is not selected is hovered, as the flat navigation bar's labels do */
    hoveredTitleStyle?: TextStyle;

    /** Background of the selected row, the one the flat navigation bar's selected row uses */
    selectedStyle?: ViewStyle;

    /** Background of a hovered row that is not selected, the one the flat navigation bar's hovered row uses */
    hoveredStyle?: ViewStyle;
};

/**
 * Gives a row of a tab's sidebar (Inbox, Workspaces, Domains, Account) the look of the flat navigation bar's
 * rows when the bar is shown, and no overrides otherwise, so the sidebars stay as they are for users outside the beta.
 */
function getFlatNavSidebarRowProps(isSelected: boolean, shouldUseFlatNavigationBar: boolean, styles: ThemeStyles): FlatNavSidebarRowProps {
    if (!shouldUseFlatNavigationBar) {
        return {};
    }
    return {
        shouldShowBasicTitle: !isSelected,
        titleStyle: isSelected ? undefined : styles.textSupporting,
        hoveredTitleStyle: isSelected ? undefined : styles.themeTextColor,
        selectedStyle: isSelected ? styles.hoveredComponentBG : undefined,
        hoveredStyle: styles.highlightBG,
    };
}

/** Reads whether the flat navigation bar is shown once and returns getFlatNavSidebarRowProps for a row's selected state. */
function useFlatNavSidebarRowProps() {
    const styles = useThemeStyles();
    const shouldUseFlatNavigationBar = useShouldUseFlatNavigationBar();

    return (isSelected: boolean) => getFlatNavSidebarRowProps(isSelected, shouldUseFlatNavigationBar, styles);
}

export default useFlatNavSidebarRowProps;
export {getFlatNavSidebarRowProps};
export type {FlatNavSidebarRowProps};
