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
        const progress = new Animated.Value(1);
        const setValue = jest.spyOn(progress, 'setValue');
        render(
            <OverlayConsumer
                condition
                progress={progress}
            />,
        );

        expect(setValue).toHaveBeenCalledWith(0);
        expect(events).toEqual(['mounted', 'started']);
        expect(timing).toHaveBeenCalledWith(progress, expect.objectContaining({toValue: 1, useNativeDriver: true}));
    });

    it('retains the scrim until its closing animation finishes', () => {
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

        expect(stop).toHaveBeenCalled();
        expect(screen.getByTestId('stacked-scrim')).toBeOnTheScreen();
        expect(timing).toHaveBeenLastCalledWith(progress, expect.objectContaining({toValue: 0, useNativeDriver: true}));

        act(() => completions.at(-1)?.({finished: true}));
        expect(screen.queryByTestId('stacked-scrim')).toBeNull();
    });

    it('does not unmount a reopened scrim when the old closing callback arrives', () => {
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

        act(() => close?.({finished: false}));
        expect(screen.getByTestId('stacked-scrim')).toBeOnTheScreen();

        rerender(
            <OverlayConsumer
                condition
                progress={progress}
            />,
        );
        act(() => close?.({finished: true}));
        expect(screen.getByTestId('stacked-scrim')).toBeOnTheScreen();
        expect(events.filter((event) => event === 'mounted')).toHaveLength(1);
    });
});
