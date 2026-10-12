// Preserve the platform-specific height and landscape policies in the shared responsive hook.
import variables from '@styles/variables';

import {Dimensions, Platform} from 'react-native';

function getResponsiveLayoutConstraints(windowHeight: number, isInLandscapeMode: boolean) {
    const isWeb = Platform.OS === 'web';
    // The soft keyboard changes the mWeb window height, so use the screen height there.
    const height = isWeb ? Dimensions.get('screen').height : windowHeight;

    return {
        isExtraSmallScreenHeight: height <= variables.extraSmallMobileResponsiveHeightBreakpoint,
        shouldUseNarrowLayoutForLandscape: isWeb && isInLandscapeMode,
    };
}

export default getResponsiveLayoutConstraints;
