import colors from '@styles/theme/colors';
import type {ThemeColors} from '@styles/theme/types';

import lightTheme from './light';

const lightContrastTheme = {
    ...lightTheme,
    border: colors.productLight500,
    icon: colors.productLight800,
    textSupporting: '#53645C',
    // The default theme trades some contrast for a softer look on RBR and GBR text. High contrast takes it back,
    // so a reader who needs the extra separation from the background gets it.
    textError: colors.tangerine700,
    textSuccess: colors.green700,
    buttonSuccessText: colors.productLight900,
    buttonDangerText: colors.productDark100,
    bordersBold: colors.productLight800,
    buttonIcon: colors.productLight900,
    mentionText: colors.blue700,
    textLight: colors.productLight900,
    iconColorfulBackground: colors.yellow800,
    receiptPlaceholderPlus: colors.green800,
    isHighContrast: true,
} satisfies ThemeColors;

export default lightContrastTheme;
