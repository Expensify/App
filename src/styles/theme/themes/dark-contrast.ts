import colors from '@styles/theme/colors';
import type {ThemeColors} from '@styles/theme/types';
import darkTheme from './dark';

const darkContrastTheme = {
    ...darkTheme,
    border: colors.productDark500,
    icon: colors.productDark700,
    textSupporting: colors.productDark800,
    buttonSuccessText: colors.productLight900,
    bordersBold: colors.productDark700,
    buttonIcon: colors.productDark900,
    mentionText: colors.blue700,
    textLight: colors.productLight900,
    iconColorfulBackground: colors.yellow800,
    mentionBG: colors.blue100,
    ourMentionBG: colors.green100,
    ourMentionText: colors.green700,
} satisfies ThemeColors;

export default darkContrastTheme;
