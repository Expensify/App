import useThemeStyles from '@hooks/useThemeStyles';

import Log from '@libs/Log';
import CustomViewWrapper from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/CustomViewWrapper';

import React, {Activity, useEffect, useRef} from 'react';

import type ScreenActivityWrapperProps from './types';

/**
 * Deprioritizes rendering of a blurred screen with React <Activity>. Unlike react-freeze, a hidden Activity keeps
 * processing state updates at background priority and runs effect cleanups when hiding, so a modal or popover that
 * is still dismissing when the screen gets blurred always finishes its close chain.
 *
 * The mode flips to hidden as soon as the screen is blurred. CustomViewWrapper neutralizes the display none that a
 * hidden Activity applies to its content, so the screen stays painted and the navigator's card visibility keeps
 * deciding what is actually shown - a covered screen that is still on screen (e.g. dimmed under the RHP overlay on
 * wide layouts) does not disappear, it only stops updating until it is revealed again.
 */
function ScreenActivityWrapper({isScreenBlurred, routeKey, routeName, children}: ScreenActivityWrapperProps) {
    const styles = useThemeStyles();
    const mode = isScreenBlurred ? 'hidden' : 'visible';
    const previousModeRef = useRef<typeof mode | null>(null);

    useEffect(() => {
        if (previousModeRef.current === mode) {
            return;
        }

        const isFirstMount = previousModeRef.current === null;
        previousModeRef.current = mode;
        Log.info(`[ScreenActivityWrapper] ${isFirstMount ? 'Activity mounted' : 'Activity state changed'}`, false, {
            routeKey,
            routeName,
            mode,
        });
    }, [mode, routeKey, routeName]);

    return (
        <Activity mode={mode}>
            <CustomViewWrapper style={styles.flex1}>{children}</CustomViewWrapper>
        </Activity>
    );
}

export default ScreenActivityWrapper;
