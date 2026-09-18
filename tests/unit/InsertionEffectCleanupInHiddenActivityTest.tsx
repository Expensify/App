import {render} from '@testing-library/react-native';

import type {ActivityProps} from 'react';

import {Activity, useEffect, useInsertionEffect} from 'react';
import {View} from 'react-native';

// The renderer patches run-insertion-effect-cleanup-in-hidden-subtree (react-native 044, react-test-renderer 001) make a
// component removed inside a hidden <Activity> run its useInsertionEffect cleanup, as react-dom 19.2 and React 19.3 do.

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

        expect(onPassiveCleanup).toHaveBeenCalledTimes(1);
        expect(onInsertionCleanup).not.toHaveBeenCalled();
    });

    it('runs when the component is removed while the Activity is hidden', () => {
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

        rerender(
            <Screen
                mode="hidden"
                isProbeMounted={false}
                onInsertionCleanup={onInsertionCleanup}
                onPassiveCleanup={onPassiveCleanup}
            />,
        );

        expect(onInsertionCleanup).toHaveBeenCalledTimes(1);
        // The hide already ran the passive cleanup, and React runs none for a removal inside a hidden subtree.
        expect(onPassiveCleanup).toHaveBeenCalledTimes(1);
    });

    it('runs when the component is removed while the Activity is visible', () => {
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
                mode="visible"
                isProbeMounted={false}
                onInsertionCleanup={onInsertionCleanup}
                onPassiveCleanup={onPassiveCleanup}
            />,
        );

        expect(onInsertionCleanup).toHaveBeenCalledTimes(1);
        expect(onPassiveCleanup).toHaveBeenCalledTimes(1);
    });
});
