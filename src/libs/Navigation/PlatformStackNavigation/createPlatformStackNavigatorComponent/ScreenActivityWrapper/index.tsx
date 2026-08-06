import useThemeStyles from '@hooks/useThemeStyles';

import CustomViewWrapper from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/CustomViewWrapper';

import React, {Activity} from 'react';

import type ScreenActivityWrapperProps from './types';

import useIsScreenCovered from './useIsScreenCovered';
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
 *
 * That painted content is stale for as long as the screen is covered, so it is marked inert for that whole time,
 * which keeps it out of the accessibility tree, the tab order and the reach of the pointer. The flag follows the
 * navigation state rather than the Activity mode, because a reveal is deferred until the transition ends and the
 * screen the user is already looking at has to be usable right away.
 */
function ScreenActivityWrapper({isScreenBlurred, routeKey, routeName, children}: ScreenActivityWrapperProps) {
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
