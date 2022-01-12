import {create} from '@storybook/theming';
import colors from '../src/styles/colors';

export default create({
    base: 'light',
    brandTitle: 'Expensify UI Docs',
    brandImage: 'logomark.svg',
    appBg: colors.dark,
    textColor: 'rgba(255,255,255,0.9)',
    textInverseColor: colors.black,
    fontBase: 'GTAmericaExp-Regular',
    inputBg: colors.gray1,
});
