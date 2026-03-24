import colors from '@styles/theme/colors';
import type {ThemeColors} from '@styles/theme/types';
import lightTheme from './light';

const lightContrastTheme = {
    ...lightTheme,
    border: colors.productLight500,
    icon: colors.productLight800,
    textSupporting: '#53645C',
    buttonSuccessText: colors.productLight900,
    bordersBold: colors.productLight800,
    buttonIcon: colors.productLight900,
    mentionText: colors.blue700,
    textLight: colors.productLight900,
    iconColorfulBackground: colors.yellow800,
} satisfies ThemeColors;

export default lightContrastTheme;
