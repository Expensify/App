import {render} from '@testing-library/react-native';

import type {ActivityProps} from 'react';

import {Activity, useEffect, useInsertionEffect} from 'react';
import {View} from 'react-native';

// The renderer patches run-insertion-effect-cleanup-in-hidden-subtree (react-native 044, react-test-renderer 001) make a
// component removed inside a hidden <Activity> run its useInsertionEffect cleanup, as react-dom 19.2 and React 19.3 do.
// TODO: Remove this test together with both patches once the App migrates to React 19.3, which runs the cleanup unconditionally.

type EffectProbeProps = {
    onInsertionCleanup: () => void;
    onPassiveCleanup: () => void;
};

function EffectProbe({onInsertionCleanup, onPassiveCleanup}: EffectProbeProps) {
    useInsertionEffect(() => onInsertionCleanup, [onInsertionCleanup]);
    useEffect(() => onPassiveCleanup, [onPassiveCleanup]);
    return <View />;
}

function Screen({mode, isProbeMounted, onInsertionCleanup, onPassiveCleanup}: EffectProbeProps & {mode: ActivityProps['mode']; isProbeMounted: boolean}) {
    return (
        <Activity mode={mode}>
            {isProbeMounted ? (
                <EffectProbe
                    onInsertionCleanup={onInsertionCleanup}
                    onPassiveCleanup={onPassiveCleanup}
                />
            ) : null}
        </Activity>
    );
}

describe('useInsertionEffect cleanup inside a hidden Activity', () => {
    it('is skipped when the Activity only hides', () => {
        // Given a probe mounted inside a visible Activity, so both of its effects are set up
        const onInsertionCleanup = jest.fn();
        const onPassiveCleanup = jest.fn();
        const {rerender} = render(
            <Screen
                mode="visible"
                isProbeMounted
                onInsertionCleanup={onInsertionCleanup}
                onPassiveCleanup={onPassiveCleanup}
            />,
        );

        // When the Activity hides while the probe stays mounted
        rerender(
            <Screen
                mode="hidden"
                isProbeMounted
                onInsertionCleanup={onInsertionCleanup}
                onPassiveCleanup={onPassiveCleanup}
            />,
        );

        // Then only the passive cleanup runs, because the patch must not change how React treats insertion effects on a plain hide
        expect(onPassiveCleanup).toHaveBeenCalledTimes(1);
        expect(onInsertionCleanup).not.toHaveBeenCalled();
    });

    it('runs when the component is removed while the Activity is hidden', () => {
        // Given a probe that was mounted in a visible Activity and then hidden, which is the case the unpatched renderer leaks
        const onInsertionCleanup = jest.fn();
        const onPassiveCleanup = jest.fn();
        const {rerender} = render(
            <Screen
                mode="visible"
                isProbeMounted
                onInsertionCleanup={onInsertionCleanup}
                onPassiveCleanup={onPassiveCleanup}
            />,
        );
        rerender(
            <Screen
                mode="hidden"
                isProbeMounted
                onInsertionCleanup={onInsertionCleanup}
                onPassiveCleanup={onPassiveCleanup}
            />,
        );

        // When the probe is removed while the Activity is still hidden
        rerender(
            <Screen
                mode="hidden"
                isProbeMounted={false}
                onInsertionCleanup={onInsertionCleanup}
                onPassiveCleanup={onPassiveCleanup}
            />,
        );

        // Then the insertion cleanup runs so nothing it registered leaks, and the passive cleanup is not repeated because the hide already ran it
        expect(onInsertionCleanup).toHaveBeenCalledTimes(1);
        expect(onPassiveCleanup).toHaveBeenCalledTimes(1);
    });

    it('runs when the component is removed while the Activity is visible', () => {
        // Given a probe mounted inside a visible Activity, as a baseline that the patch leaves the regular removal path intact
        const onInsertionCleanup = jest.fn();
        const onPassiveCleanup = jest.fn();
        const {rerender} = render(
            <Screen
                mode="visible"
                isProbeMounted
                onInsertionCleanup={onInsertionCleanup}
                onPassiveCleanup={onPassiveCleanup}
            />,
        );

        // When the probe is removed without the Activity ever hiding
        rerender(
            <Screen
                mode="visible"
                isProbeMounted={false}
                onInsertionCleanup={onInsertionCleanup}
                onPassiveCleanup={onPassiveCleanup}
            />,
        );

        // Then both cleanups run exactly once, as they do for any unmount outside a hidden subtree
        expect(onInsertionCleanup).toHaveBeenCalledTimes(1);
        expect(onPassiveCleanup).toHaveBeenCalledTimes(1);
    });
});
