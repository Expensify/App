import {isMobile} from '@libs/Browser';

import {Dimensions} from 'react-native';

export default function isInLandscapeMode(windowWidth = Dimensions.get('window').width, windowHeight = Dimensions.get('window').height): boolean {
    return isMobile() && windowWidth > windowHeight;
}
