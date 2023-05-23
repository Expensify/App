import {create} from '@storybook/theming';
import colors from '../src/styles/colors';

export default create({
    brandTitle: 'New Expensify UI Docs',
    brandImage: 'logomark.svg',
    fontBase: 'ExpensifyNeue-Regular',
    fontCode: 'monospace',
    base: 'dark',
    appBg: colors.greenHighlightBackground,
    colorPrimary: colors.greenDefaultButton,
    colorSecondary: colors.green,
    appContentBg: colors.greenAppBackground,
    textColor: colors.white,
    barTextColor: colors.white,
    barSelectedColor: colors.green,
    barBg: colors.greenAppBackground,
    appBorderColor: colors.greenBorders,
    inputBg: colors.greenHighlightBackground,
    inputBorder: colors.greenBorders,
    appBorderRadius: 8,
    inputBorderRadius: 8,
});
