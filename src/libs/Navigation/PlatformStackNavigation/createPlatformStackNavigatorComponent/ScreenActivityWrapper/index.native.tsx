import useThemeStyles from '@hooks/useThemeStyles';

import CustomViewWrapper from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/CustomViewWrapper';

import React, {Activity} from 'react';

import type ScreenActivityWrapperProps from './types';

import useScreenActivityMode from './useScreenActivityMode';

/**
 * Deprioritizes rendering of a blurred screen with React <Activity>. Unlike react-freeze, a hidden Activity keeps
 * processing state updates at background priority and runs effect cleanups when hiding. A modal or popover that is
 * still dismissing when the screen gets blurred always finishes its close chain, so no freeze delay and no modal
 * coordination are needed here. useScreenActivityMode decides when the screen is deprioritized.
 */
function ScreenActivityWrapper({isScreenBlurred, routeKey, routeName, children}: ScreenActivityWrapperProps) {
    const styles = useThemeStyles();
    const mode = useScreenActivityMode({isScreenBlurred, routeKey, routeName});

    // A hidden Activity hides its content through the same mechanism as a suspended tree, so CustomViewWrapper
    // keeps the content painted and the underlay screen stays visible during swipe-back gestures.
    return (
        <Activity mode={mode}>
            <CustomViewWrapper style={styles.flex1}>{children}</CustomViewWrapper>
        </Activity>
    );
}

export default ScreenActivityWrapper;
