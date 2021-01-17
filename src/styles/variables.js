import {Dimensions , Platform} from 'react-native';

export default {
    contentHeaderHeight: 65,
    componentSizeSmall: 28,
    componentSizeNormal: 40,
    componentSizeLarge: 50,
    componentBorderRadius: 8,
    fontSizeSmall: 11,
    fontSizeLabel: 13,
    fontSizeNormal: 15,
    fontSizeLarge: 17,
    fontSizeh1: 19,
    mobileResponsiveWidthBreakpoint: 1000,
    safeInsertPercentage: 0.7,
    sideBarWidth: Platform.isPad ? 300 : Dimensions.get('window').width,
};
