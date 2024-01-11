import {Dimensions} from 'react-native';
import variables from '@styles/variables';

export default function getIsSmallScreenWidth(windowWidth = Dimensions.get('window').width) {
    console.log(`windowWidth: ${windowWidth}`);
    console.log(`Var: ${variables.mobileResponsiveWidthBreakpoint}`);
    return windowWidth <= variables.mobileResponsiveWidthBreakpoint;
}
