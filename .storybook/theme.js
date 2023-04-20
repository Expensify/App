import {create} from '@storybook/theming';
import colors from '../src/styles/colors';

export default create({
    brandTitle: 'New Expensify UI Docs',
    brandImage: 'logomark.svg',
    fontBase: 'ExpensifyNeue-Regular',
    fontCode: 'monospace',
    appBg: colors.greenAppBackground,
    colorPrimary: colors.greenDefaultButton,
    colorSecondary: colors.green,
    appContentBg: colors.greenAppBackground,
    textColor: colors.white,
    textInverseColor: colors.white,
    barTextColor: colors.white,
    barSelectedColor: colors.blueLink,
    barBg: colors.greenHighlightBackground,
    appBorderColor: colors.greenBorders,
    inputBg: colors.greenHighlightBackground,
    inputBorder: colors.greenBorders,

});
