import {create} from '@storybook/theming';
import colors from '../src/styles/colors';

export default create({
    brandTitle: 'New Expensify UI Docs',
    brandImage: 'logomark.svg',
    fontBase: 'ExpensifyNeue-Regular',
    fontCode: 'monospace',
    base: 'dark',
    appBg: colors.darkHighlightBackground,
    colorPrimary: colors.darkDefaultButton,
    colorSecondary: colors.green,
    appContentBg: colors.darkAppBackground,
    textColor: colors.darkPrimaryText,
    barTextColor: colors.darkPrimaryText,
    barSelectedColor: colors.green,
    barBg: colors.darkAppBackground,
    appBorderColor: colors.darkBorders,
    inputBg: colors.darkHighlightBackground,
    inputBorder: colors.darkBorders,
    appBorderRadius: 8,
    inputBorderRadius: 8,
});
