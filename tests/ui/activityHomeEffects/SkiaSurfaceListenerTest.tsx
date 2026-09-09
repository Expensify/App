import {act, screen} from '@testing-library/react-native';

import useIsSkiaSurfaceUnavailable from '@components/Charts/SkiaWebChart/useIsSkiaSurfaceUnavailable';

import React, {useRef} from 'react';
import {View} from 'react-native';

import renderScreenWithCover, {getCoverMode} from '../../utils/ScreenCoverHarness';

/**
 * The web charts listen on their container for the event the patched Skia renderer dispatches when it cannot create a
 * drawing surface. Covering the Home tab runs the listener cleanup and uncovering it runs the effect again, so this
 * suite counts the listener calls on the container to prove the pair stays symmetric and nothing leaks.
 */

// The event the patched Skia web renderer dispatches when it cannot create a drawing surface.
const SURFACE_UNAVAILABLE_EVENT = 'skia-surface-unavailable';

type SkiaSurfaceProbeProps = {
    /** The DOM element that stands in for the chart container the renderer dispatches into. */
    container: HTMLElement;
};

/** Stands in for a chart: the ref keeps the same identity across renders, the way a container ref does in the chart. */
function SkiaSurfaceProbe({container}: SkiaSurfaceProbeProps) {
    const containerRef = useRef<HTMLElement | null>(container);
    const isSurfaceUnavailable = useIsSkiaSurfaceUnavailable(containerRef);

    return <View testID={isSurfaceUnavailable ? 'skia-surface-unavailable' : 'skia-surface-available'} />;
}

function countSurfaceListenerCalls(calls: ReadonlyArray<readonly [eventName: string, ...rest: unknown[]]>): number {
    return calls.filter(([eventName]) => eventName === SURFACE_UNAVAILABLE_EVENT).length;
}

function createSpiedContainer() {
    const container = document.createElement('div');
    const addSpy = jest.spyOn(container, 'addEventListener');
    const removeSpy = jest.spyOn(container, 'removeEventListener');

    return {
        container,
        addedCount: () => countSurfaceListenerCalls(addSpy.mock.calls),
        removedCount: () => countSurfaceListenerCalls(removeSpy.mock.calls),
    };
}

function dispatchSurfaceUnavailable(container: HTMLElement) {
    act(() => {
        container.dispatchEvent(new CustomEvent(SURFACE_UNAVAILABLE_EVENT, {bubbles: true}));
    });
}

describe('useIsSkiaSurfaceUnavailable under a screen cover', () => {
    it('adds the listener on mount and removes it on hide only under activity', async () => {
        const {container, addedCount, removedCount} = createSpiedContainer();
        const home = renderScreenWithCover(<SkiaSurfaceProbe container={container} />);

        expect(addedCount()).toBe(1);
        expect(removedCount()).toBe(0);

        await home.hide();

        expect(addedCount()).toBe(1);
        expect(removedCount()).toBe(getCoverMode() === 'activity' ? 1 : 0);
    });

    it('re-adds the listener on reveal and leaves exactly one attached', async () => {
        const {container, addedCount, removedCount} = createSpiedContainer();
        const home = renderScreenWithCover(<SkiaSurfaceProbe container={container} />);

        await home.hide();
        await home.reveal();

        expect(addedCount() - removedCount()).toBe(1);
        expect(screen.getByTestId('skia-surface-available')).toBeOnTheScreen();

        dispatchSurfaceUnavailable(container);

        expect(screen.getByTestId('skia-surface-unavailable')).toBeOnTheScreen();
    });

    it('stops hearing the renderer while covered only under activity', async () => {
        const {container} = createSpiedContainer();
        const home = renderScreenWithCover(<SkiaSurfaceProbe container={container} />);

        await home.hide();
        dispatchSurfaceUnavailable(container);
        await home.reveal();

        expect(screen.getByTestId(getCoverMode() === 'activity' ? 'skia-surface-available' : 'skia-surface-unavailable')).toBeOnTheScreen();
    });

    it('removes every listener it added once the screen unmounts after a hide/reveal cycle', async () => {
        const {container, addedCount, removedCount} = createSpiedContainer();
        const home = renderScreenWithCover(<SkiaSurfaceProbe container={container} />);

        await home.hide();
        await home.reveal();
        home.unmount();

        expect(addedCount()).toBeGreaterThan(0);
        expect(removedCount()).toBe(addedCount());
    });
});
