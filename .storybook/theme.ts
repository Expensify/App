import type {ThemeVars} from 'storybook/theming';
import {create} from 'storybook/theming/create';
// eslint-disable-next-line @dword-design/import-alias/prefer-alias
import colors from '../src/styles/theme/colors';

const theme: ThemeVars = create({
    brandTitle: 'New Expensify UI Docs',
    brandImage: 'logomark.svg',
    fontBase: 'Expensify Neue',
    fontCode: 'monospace',
    base: 'dark',
    appBg: colors.productDark200,
    colorPrimary: colors.productDark400,
    colorSecondary: colors.green,
    appContentBg: colors.productDark100,
    appPreviewBg: colors.productDark100,
    textColor: colors.productDark900,
    barTextColor: colors.productDark900,
    barSelectedColor: colors.green,
    barBg: colors.productDark100,
    appBorderColor: colors.productDark400,
    inputBg: colors.productDark200,
    inputBorder: colors.productDark400,
    appBorderRadius: 8,
    inputBorderRadius: 8,
});

export default theme;
