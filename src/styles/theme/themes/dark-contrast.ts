import colors from '@styles/theme/colors';
import type {ThemeColors} from '@styles/theme/types';
import darkTheme from './dark';

const darkContrastTheme = {
    ...darkTheme,
    border: colors.productDark500,
    icon: colors.productDark700,
    textSupporting: colors.productDark700,
    buttonSuccessText: colors.productDark900,
    bordersBold: colors.productDark700,
    buttonIcon: colors.productDark900,
    mentionText: colors.blue600,
    textLight: colors.productDark900,
} satisfies ThemeColors;

export default darkContrastTheme;
