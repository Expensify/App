import {Color} from './themes/types';

/**
 * DO NOT import colors.js into files. Use the theme switching hooks and HOCs instead.
 * For functional components, you can use the `useTheme` and `useThemeStyles` hooks
 * For class components, you can use the `withTheme` and `withThemeStyles` HOCs
 */
const colors: Record<string, Color> = {
    // Brand Colors
    black: '#000000',
    white: '#FFFFFF',
    ivory: '#fffaf0',
    green: '#03D47C',
    greenHover: '#00C271',
    greenPressed: '#35DD96',
    red: '#F25730',
    redHover: '#DE4822',
    redPressed: '#F57959',
    transparent: 'transparent',

    // Dark Mode Theme Colors
    darkAppBackground: '#061B09',
    darkHighlightBackground: '#07271F',
    darkBorders: '#1A3D32',
    darkIcons: '#8B9C8F',
    darkSupportingText: '#AFBBB0',
    darkPrimaryText: '#E7ECE9',
    darkDefaultButton: '#184E3D',
    darkDefaultButtonHover: '#2C6755',
    darkDefaultButtonPressed: '#467164',

    // Light Mode Theme Colors
    lightAppBackground: '#FCFBF9',
    lightHighlightBackground: '#F8F4F0',
    lightBorders: '#EBE6DF',
    lightBordersLighter: '#2B5548',
    lightIcons: '#A2A9A3',
    lightSupportingText: '#76847E',
    lightPrimaryText: '#002E22',
    lightDefaultButton: '#EEEBE7',
    lightDefaultButtonHover: '#E3DFD9',
    lightDefaultButtonPressed: '#D2CCC3',

    // Brand Colors from Figma
    blue100: '#B0D9FF',
    blue200: '#8DC8FF',
    blue300: '#5AB0FF',
    blue400: '#0185FF',
    blue500: '#0676DE',
    blue600: '#0164BF',
    blue700: '#003C73',
    blue800: '#002140',

    green100: '#B1F2D6',
    green200: '#8EECC4',
    green300: '#5BE3AA',
    green400: '#03D47C',
    green500: '#00B268',
    green600: '#008C59',
    green700: '#085239',
    green800: '#002E22',

    yellow100: '#FFF2B2',
    yellow200: '#FFED8F',
    yellow300: '#FEE45E',
    yellow400: '#FED607',
    yellow500: '#E4BC07',
    yellow600: '#D18000',
    yellow700: '#722B03',
    yellow800: '#401102',

    tangerine100: '#FFD7B0',
    tangerine200: '#FFC68C',
    tangerine300: '#FFA75A',
    tangerine400: '#FF7101',
    tangerine500: '#F25730',
    tangerine600: '#BF3013',
    tangerine700: '#780505',
    tangerine800: '#400000',

    pink100: '#FCDCFF',
    pink200: '#FBCCFF',
    pink300: '#F9B5FE',
    pink400: '#F68DFE',
    pink500: '#E96DF2',
    pink600: '#CF4CD9',
    pink700: '#712A76',
    pink800: '#49225B',

    ice100: '#DFFDFE',
    ice200: '#CCF7FF',
    ice300: '#A5FBFF',
    ice400: '#50EEF6',
    ice500: '#4ED7DE',
    ice600: '#4BA6A6',
    ice700: '#28736D',
    ice800: '#134038',
};

export default colors;
