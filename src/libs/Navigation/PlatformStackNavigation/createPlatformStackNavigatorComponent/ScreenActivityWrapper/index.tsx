import useThemeStyles from '@hooks/useThemeStyles';

import CustomViewWrapper from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/CustomViewWrapper';
import type NonTopScreenWrapperProps from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/nonTopScreenWrapperTypes';

import React, {Activity} from 'react';

import useScreenActivityState from './useScreenActivityState';

/**
 * Deprioritizes rendering of a covered screen with React <Activity>. Unlike react-freeze, a hidden Activity keeps
 * processing updates at background priority and runs effect cleanups, so a modal that is still dismissing when the
 * screen gets covered always finishes its close chain. CustomViewWrapper keeps the hidden content painted, so a
 * covered screen that is still shown (for example dimmed under the RHP overlay) does not disappear.
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
