import useScreenActivityEffect from '@hooks/useScreenActivityEffect';

import StrictModeMountGate from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper/StrictModeMountGate';

import React, {useEffect} from 'react';

import type {ScreenProps} from '../../../utils/ScreenActivityEffectTestUtils';

import {ActivityScreen, hidden, resetLog, runOn, Subject, visible} from '../../../utils/ScreenActivityEffectTestUtils';

// The gate picks its implementation at module load, so the flag has to be mocked before the import above runs.
jest.mock('@src/CONFIG', () => ({__esModule: true, default: {USE_ACTIVITY_SCREEN_STRICT_MODE_IN_DEV: true}}));

/**
 * React double-invokes layout and passive effects under StrictMode, never an insertion effect, so the hook sees the
 * double invocation as a passive cleanup with nothing owed followed by a body with nothing owed. These tests cover the
 * gate every screen opting into <Activity> renders below it and a StrictMode above the whole screen.
 */

/** The screen a development build renders, with the qualification gate below the <Activity>. */
function GatedActivityScreen({isHidden: isScreenHidden, children}: ScreenProps) {
    return (
        <ActivityScreen isHidden={isScreenHidden}>
            <StrictModeMountGate>{children}</StrictModeMountGate>
        </ActivityScreen>
    );
}

/** A live screen with the same gate, which is what the gate alone does to an effect. */
function GatedLiveScreen({children}: ScreenProps) {
    return <StrictModeMountGate>{children}</StrictModeMountGate>;
}

/** The gate above the <Activity>, which is what a StrictMode higher up in the tree does to the whole screen. */
function GateAboveScreen({isHidden: isScreenHidden, children}: ScreenProps) {
    return (
        <StrictModeMountGate>
            <ActivityScreen isHidden={isScreenHidden}>{children}</ActivityScreen>
        </StrictModeMountGate>
    );
}

describe('useScreenActivityEffect under the StrictMode gate of a screen that opted into Activity', () => {
    beforeEach(() => {
        resetLog();
    });

    it('keeps the setup live through a cover and reveal cycle under a StrictMode above the screen', async () => {
        // Given a StrictMode above the <Activity>, which makes React double-invoke every effect of a revealed <Activity>
        const steps = [visible(<Subject value="a" />), hidden(<Subject value="a" />), visible(<Subject value="a" />)];

        // When the screen is covered and revealed
        const activity = await runOn(useScreenActivityEffect, GateAboveScreen, steps);

        // Then the reveal leaves the setup alone, because that double invocation is a passive cleanup with nothing
        // owed followed by a passive setup with nothing owed
        expect(activity).toEqual([['setup:s:a'], [], [], ['cleanup:s:a']]);
    });

    it('keeps the setup live through a cover and reveal cycle below the gate', async () => {
        // Given an effect on a screen with the gate below the <Activity>, which is where the wrapper renders it
        const steps = [visible(<Subject value="a" />), hidden(<Subject value="a" />), visible(<Subject value="a" />)];

        // When the screen is covered and revealed
        const live = await runOn(useEffect, GatedLiveScreen, steps);
        const activity = await runOn(useScreenActivityEffect, GatedActivityScreen, steps);

        // Then the gate changed nothing about the cover, and the hook skipped the remount cycle of the mount as well
        expect(live).toEqual([['setup:s:a', 'cleanup:s:a', 'setup:s:a'], [], [], ['cleanup:s:a']]);
        expect(activity).toEqual([['setup:s:a'], [], [], ['cleanup:s:a']]);
    });
});
