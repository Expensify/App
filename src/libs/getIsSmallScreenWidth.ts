import {Dimensions} from 'react-native';
import variables from '@styles/variables';

export default function getIsSmallScreenWidth(windowWidth = Dimensions.get('window').width) {
    return windowWidth <= variables.mobileResponsiveWidthBreakpoint;
}
