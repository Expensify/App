import colors from '@styles/theme/colors';
import type {ThemeColors} from '@styles/theme/types';

import darkTheme from './dark';

const darkContrastTheme = {
    ...darkTheme,
    // Keep nav rows/tabs at the stronger prior values so their state stays legible under high contrast
    navItemHoverBG: colors.productDark300,
    navItemSelectedBG: colors.productDark400,
    border: colors.productDark500,
    icon: colors.productDark700,
    textSupporting: colors.productDark800,
    buttonSuccessText: colors.productLight900,
    buttonDangerText: colors.productDark100,
    bordersBold: colors.productDark700,
    buttonIcon: colors.productDark900,
    mentionText: colors.blue700,
    textLight: colors.productLight900,
    iconColorfulBackground: colors.yellow800,
    mentionBG: colors.blue100,
    ourMentionBG: colors.green100,
    ourMentionText: colors.green700,
    receiptPlaceholderPlus: colors.green800,
    isHighContrast: true,
} satisfies ThemeColors;

export default darkContrastTheme;
