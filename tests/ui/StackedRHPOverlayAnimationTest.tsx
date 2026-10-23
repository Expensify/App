import {act, render, screen} from '@testing-library/react-native';

import useShouldRenderOverlay from '@components/WideRHPContextProvider/useShouldRenderOverlay';

import React, {useLayoutEffect} from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated, View} from 'react-native';

type AnimationCompletion = (result: {finished: boolean}) => void;

const events: string[] = [];

function Scrim() {
    useLayoutEffect(() => {
        events.push('mounted');
    }, []);
    return <View testID="stacked-scrim" />;
}

function OverlayConsumer({condition, progress}: {condition: boolean; progress: Animated.Value}) {
    const shouldRender = useShouldRenderOverlay(condition, progress);
    return shouldRender ? <Scrim /> : null;
}

describe('Stacked RHP overlay animation', () => {
    let completions: Array<AnimationCompletion | undefined>;
    let timing: jest.SpyInstance;
    let stop: jest.Mock;

    beforeEach(() => {
        events.length = 0;
        completions = [];
        stop = jest.fn();
        timing = jest.spyOn(Animated, 'timing').mockImplementation(() => {
            events.push('started');
            return {start: (callback) => completions.push(callback), stop, reset: jest.fn()};
        });
    });

    afterEach(() => {
        timing.mockRestore();
    });

    it('mounts a transparent scrim before starting a native-driven fade', () => {
        // Given a reused progress value could otherwise make a newly mounted scrim flash fully opaque
        const progress = new Animated.Value(1);
        const setValue = jest.spyOn(progress, 'setValue');
        // When a stacked panel first needs its scrim
        render(
            <OverlayConsumer
                condition
                progress={progress}
            />,
        );

        // Then it must mount transparently before native animation starts so the first visible frame can fade in
        expect(setValue).toHaveBeenCalledWith(0);
        expect(events).toEqual(['mounted', 'started']);
        expect(timing).toHaveBeenCalledWith(progress, expect.objectContaining({toValue: 1, useNativeDriver: true}));
    });

    it('retains the scrim until its closing animation finishes', () => {
        // Given the scrim must remain mounted to show the closing fade
        const progress = new Animated.Value(0);
        const {rerender} = render(
            <OverlayConsumer
                condition
                progress={progress}
            />,
        );
        // When the stacked panel closes while its opening animation may still be active
        rerender(
            <OverlayConsumer
                condition={false}
                progress={progress}
            />,
        );

        // Then the opening animation is stopped without removing the view needed for the closing animation
        expect(stop).toHaveBeenCalled();
        expect(screen.getByTestId('stacked-scrim')).toBeOnTheScreen();
        expect(timing).toHaveBeenLastCalledWith(progress, expect.objectContaining({toValue: 0, useNativeDriver: true}));

        // When the closing animation confirms it has finished
        act(() => completions.at(-1)?.({finished: true}));
        // Then removing the scrim is safe because no visible fade remains
        expect(screen.queryByTestId('stacked-scrim')).toBeNull();
    });

    it('does not unmount a reopened scrim when the old closing callback arrives', () => {
        // Given a closing animation can report completion after the panel has changed direction
        const progress = new Animated.Value(0);
        const {rerender} = render(
            <OverlayConsumer
                condition
                progress={progress}
            />,
        );
        rerender(
            <OverlayConsumer
                condition={false}
                progress={progress}
            />,
        );
        const close = completions.at(-1);

        // When an interrupted closing animation reports cancellation
        act(() => close?.({finished: false}));
        // Then cancellation must not remove a scrim that still needs to animate
        expect(screen.getByTestId('stacked-scrim')).toBeOnTheScreen();

        // When the panel reopens before a stale successful close callback arrives
        rerender(
            <OverlayConsumer
                condition
                progress={progress}
            />,
        );
        act(() => close?.({finished: true}));
        // Then the stale callback must not unmount or remount the reopened scrim and cause a flash
        expect(screen.getByTestId('stacked-scrim')).toBeOnTheScreen();
        expect(events.filter((event) => event === 'mounted')).toHaveLength(1);
    });
});
