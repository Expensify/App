import {create} from '@storybook/theming/create';
import cashLogo from '../assets/images/expensify-logo.png';
import themeColors from '../src/styles/themes/default';
import colors from '../src/styles/colors';

export default create({
    base: 'light',
    brandTitle: 'Expensify.cash',
    brandUrl: 'https://expensify.cash',
    brandImage: cashLogo,

    colorPrimary: 'green',
    colorSecondary: colors.blue,

    // UI
    appBg: colors.white,
    appContentBg: colors.gray1,
    appBorderColor: colors.gray2,
    appBorderRadius: 4,

    // Typography
    fontBase: 'GTAmericaExp-Regular',
    fontCode: 'monospace',

    // Text colors
    textColor: themeColors.text,
    textInverseColor: themeColors.textReversed,

    // Form colors
    inputBg: colors.white,
    inputBorder: colors.blue,
    inputTextColor: themeColors.text,
    inputBorderRadius: 4,

});
