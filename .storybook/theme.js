import {create} from '@storybook/theming';
import colors from '../src/styles/colors';

export default create({
    appBg: colors.dark,
    barSelectedColor: colors.blue,
    base: 'light',
    brandTitle: 'Expensify UI Docs',
    brandImage: 'logomark.svg',
    colorPrimary: colors.dark,
    colorSecondary: colors.orange,
    fontBase: 'ExpensifyNeue-Regular',
    fontCode: 'monospace',
    textInverseColor: colors.black,
});
