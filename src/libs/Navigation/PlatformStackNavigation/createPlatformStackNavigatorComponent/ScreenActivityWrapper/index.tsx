import useThemeStyles from '@hooks/useThemeStyles';

import CustomViewWrapper from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/CustomViewWrapper';
import type NonTopScreenWrapperProps from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/nonTopScreenWrapperTypes';

import React, {Activity} from 'react';

import useIsScreenCovered from './useIsScreenCovered';
import useScreenActivityMode from './useScreenActivityMode';

/**
 * Deprioritizes rendering of a covered screen with React <Activity>. Unlike react-freeze, a hidden Activity keeps
 * processing state updates at background priority and runs effect cleanups when hiding, so a modal or popover that
 * is still dismissing when the screen gets covered always finishes its close chain. That removes the freeze delay
 * and the modal coordination react-freeze needs.
 *
 * The content of a hidden Activity stays painted, because CustomViewWrapper neutralizes the hiding on both
 * platforms. The navigator's card visibility keeps deciding what is actually on screen, so a covered screen that
 * is still shown (dimmed under the RHP overlay on wide layouts, or as the underlay of a swipe-back gesture) does
 * not disappear. It only stops updating until it is revealed again.
 */
function ScreenActivityWrapper({isScreenBlurred, routeKey, routeName, children}: NonTopScreenWrapperProps) {
    const styles = useThemeStyles();
    const isScreenCovered = useIsScreenCovered(isScreenBlurred);
    const mode = useScreenActivityMode({isScreenCovered, routeKey, routeName});

    return (
        <Activity mode={mode}>
            <CustomViewWrapper
                style={styles.flex1}
                inert={isScreenCovered}
            >
                {children}
            </CustomViewWrapper>
        </Activity>
    );
}

export default ScreenActivityWrapper;
