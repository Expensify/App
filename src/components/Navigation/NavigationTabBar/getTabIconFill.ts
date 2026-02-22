import type {ThemeColors} from '@styles/theme/types';

type GetTabIconFillConfig = {
    isSelected: boolean;
    isHovered: boolean;
};

function getTabIconFill(theme: ThemeColors, {isSelected, isHovered}: GetTabIconFillConfig): string {
    if (isSelected) {
        return theme.iconMenu;
    }
    if (isHovered) {
        return theme.success;
    }
    return theme.icon;
}

export default getTabIconFill;
