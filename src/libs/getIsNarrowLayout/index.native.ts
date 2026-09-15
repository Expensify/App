import variables from '@styles/variables';

import {Dimensions} from 'react-native';

export default function getIsNarrowLayout() {
    return Dimensions.get('window').width <= variables.mobileResponsiveWidthBreakpoint;
}
