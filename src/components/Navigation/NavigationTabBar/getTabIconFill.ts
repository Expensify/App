import type {ThemeColors} from '@styles/theme/types';

function getTabIconFill(isSelected: boolean, isHovered: boolean, theme: ThemeColors) {
    if (isSelected) {
        return theme.iconMenu;
    }
    if (isHovered) {
        return theme.success;
    }
    return theme.icon;
}

export default getTabIconFill;
