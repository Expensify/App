import useThemeStyles from '@hooks/useThemeStyles';

import CustomViewWrapper from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/CustomViewWrapper';

import React, {Activity} from 'react';

import type ScreenActivityWrapperProps from './types';

import useScreenActivityMode from './useScreenActivityMode';

/**
 * Deprioritizes rendering of a blurred screen with React <Activity>. Unlike react-freeze, a hidden Activity keeps
 * processing state updates at background priority and runs effect cleanups when hiding, so a modal or popover that
 * is still dismissing when the screen gets blurred always finishes its close chain.
 *
 * useScreenActivityMode decides when the screen is deprioritized. CustomViewWrapper neutralizes the display none
 * that a hidden Activity applies to its content, so the screen stays painted and the navigator's card visibility
 * keeps deciding what is actually shown - a covered screen that is still on screen (e.g. dimmed under the RHP
 * overlay on wide layouts) does not disappear, it only stops updating until it is revealed again.
 */
function ScreenActivityWrapper({isScreenBlurred, routeKey, routeName, children}: ScreenActivityWrapperProps) {
    const styles = useThemeStyles();
    const mode = useScreenActivityMode({isScreenBlurred, routeKey, routeName});

    return (
        <Activity mode={mode}>
            <CustomViewWrapper style={styles.flex1}>{children}</CustomViewWrapper>
        </Activity>
    );
}

export default ScreenActivityWrapper;
