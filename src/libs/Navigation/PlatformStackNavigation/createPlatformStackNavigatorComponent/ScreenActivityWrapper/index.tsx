import useThemeStyles from '@hooks/useThemeStyles';

import CustomViewWrapper from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/CustomViewWrapper';
import type NonTopScreenWrapperProps from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/nonTopScreenWrapperTypes';

import React, {Activity} from 'react';

import useScreenActivityState from './useScreenActivityState';

/**
 * Deprioritizes rendering of a covered screen with React <Activity>. Unlike react-freeze, a hidden Activity keeps
 * processing state updates at background priority and runs effect cleanups when hiding, so a modal or popover that
 * is still dismissing when the screen gets covered always finishes its close chain. That removes the freeze delay
 * and the modal coordination react-freeze needs.
 *
 * CustomViewWrapper keeps the content of a hidden Activity painted on both platforms, so a covered screen that is
 * still shown (dimmed under the RHP overlay on wide layouts, or as the underlay of a swipe-back gesture) does not
 * disappear. It only stops updating until it is revealed again.
 */
function ScreenActivityWrapper({isScreenBlurred, children}: NonTopScreenWrapperProps) {
    const styles = useThemeStyles();
    const {mode, isScreenCovered} = useScreenActivityState(isScreenBlurred);

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
