import AlwaysPaintedView from '@components/AlwaysPaintedView';

import type NonTopScreenWrapperProps from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/nonTopScreenWrapperTypes';

import React, {Activity} from 'react';

import DevStrictModeMountGate from './StrictModeMountGate';
import useScreenActivityState from './useScreenActivityState';

/**
 * Deprioritizes rendering of a covered screen with React <Activity>. Unlike react-freeze, a hidden Activity keeps
 * processing updates at background priority and runs effect cleanups, so a modal that is still dismissing when the
 * screen gets covered always finishes its close chain. AlwaysPaintedView keeps the hidden content painted, so a
 * covered screen that is still shown (for example dimmed under the RHP overlay) does not disappear, and it takes
 * that content out of accessibility and touch handling while it is covered.
 *
 * StrictMode is the qualification gate for screens that opt into Activity. Its double effect mount in dev exercises
 * the same cleanup and re-run lifecycle as a hide and reveal cycle, so an effect that would misbehave under a cover
 * fails during development instead. StrictModeMountGate commits StrictMode one commit ahead of the screen content,
 * which is what makes React run that cycle for a StrictMode nested below the root.
 */
function ScreenActivityWrapper({isScreenBlurred, children}: NonTopScreenWrapperProps) {
    const {mode, isScreenCovered} = useScreenActivityState(isScreenBlurred);

    return (
        <Activity mode={mode}>
            <AlwaysPaintedView inert={isScreenCovered}>
                <DevStrictModeMountGate>{children}</DevStrictModeMountGate>
            </AlwaysPaintedView>
        </Activity>
    );
}

export default ScreenActivityWrapper;
