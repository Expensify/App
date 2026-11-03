import variables from '@styles/variables';

import {Dimensions} from 'react-native';

export default function getIsSmallScreenWidth(windowWidth = Dimensions.get('window').width) {
    return windowWidth <= variables.mobileResponsiveWidthBreakpoint;
}
