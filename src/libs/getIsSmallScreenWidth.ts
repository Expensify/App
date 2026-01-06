import {Dimensions} from 'react-native';
import variables from '@styles/variables';

export default function getIsSmallScreenWidth(windowWidth = Dimensions.get('window').width): any {
    return windowWidth <= variables.mobileResponsiveWidthBreakpoint;
}
