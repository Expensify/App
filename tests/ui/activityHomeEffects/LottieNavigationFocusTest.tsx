/**
 * Cover/reveal contract of the Lottie navigation focus listener once the Home tab sits under `ScreenActivityWrapper`.
 *
 * On web, `Lottie` swaps the animation for an empty view when the navigator blurs and swaps it back when the navigator
 * focuses again. The blur fires before a cover and the focus fires while the subtree is still hidden, so the listener
 * that would bring the animation back is not attached when the event arrives. The effect therefore has to reconcile
 * from the navigator on re-entry, otherwise Concierge's thinking avatar stays an empty box for the rest of the
 * screen's life.
 */
import {act, screen} from '@testing-library/react-native';

import Lottie from '@components/Lottie';
import type DotLottieAnimation from '@components/LottieAnimations/types';

import type * as BrowserModule from '@libs/Browser';

import CONST from '@src/CONST';
import type * as SplashScreenStateContextModule from '@src/SplashScreenStateContext';

import type {NavigationContainerRef, NavigationProp, ParamListBase} from '@react-navigation/native';
import type {View} from 'react-native';

import {NavigationContainerRefContext, NavigationContext} from '@react-navigation/native';
import React from 'react';

import createMock from '../../utils/createMock';
import renderScreenWithCover from '../../utils/ScreenCoverHarness';

const mockPlay = jest.fn();
const mockPause = jest.fn();
const mockRecordLottieMount = jest.fn();
const mockHiddenSplashScreenState = CONST.BOOT_SPLASH_STATE.HIDDEN;

// The animation only listens to the navigator on web, where `getBrowser` returns a browser name.
jest.mock('@libs/Browser', () => ({
    ...jest.requireActual<typeof BrowserModule>('@libs/Browser'),
    getBrowser: () => 'chrome',
}));

jest.mock('@src/SplashScreenStateContext', () => ({
    ...jest.requireActual<typeof SplashScreenStateContextModule>('@src/SplashScreenStateContext'),
    useSplashScreenState: () => ({splashScreenState: mockHiddenSplashScreenState}),
}));

// The real player draws to a canvas, so this stands in for it: one testID that is on screen only while the animation
// is rendered at all, plus the imperative handle the component plays and pauses through.
jest.mock('lottie-react-native', () => {
    const ReactActual = jest.requireActual<typeof React>('react');
    const {View: ViewActual} = jest.requireActual<{View: typeof View}>('react-native');

    function MockLottieView({ref}: {ref?: React.Ref<unknown>}) {
        ReactActual.useImperativeHandle(ref, () => ({play: mockPlay, pause: mockPause}));
        ReactActual.useEffect(() => {
            mockRecordLottieMount();
        }, []);

        return ReactActual.createElement(ViewActual, {testID: 'lottie-animation'});
    }

    return {__esModule: true, default: MockLottieView};
});

const ANIMATION: DotLottieAnimation = {file: 'concierge-thinking.lottie', w: 100, h: 100};

type NavigatorStub = {
    navigator: NavigationProp<ParamListBase>;
    containerRef: NavigationContainerRef<ParamListBase>;
    emitBlur: () => void;
    emitFocus: () => void;
    listenerCount: () => number;
};

/** A navigator whose focus state and events the test drives, standing in for the one the Home tab renders under. */
function createNavigatorStub(): NavigatorStub {
    const listeners = new Map<string, Set<() => void>>();
    let isNavigatorFocused = true;

    // The component ignores the event object the navigator passes, so the stub takes a plain callback.
    const addListener = (eventName: string, listener: () => void) => {
        const listenersForEvent = listeners.get(eventName) ?? new Set<() => void>();
        listenersForEvent.add(listener);
        listeners.set(eventName, listenersForEvent);

        return () => {
            listenersForEvent.delete(listener);
        };
    };

    // The real `addListener` is generic over the event name and its callback takes an event object no stub can build,
    // so it is attached to the mock rather than declared inside it.
    const navigator: NavigationProp<ParamListBase> = Object.assign(createMock<NavigationProp<ParamListBase>>({isFocused: () => isNavigatorFocused}), {addListener});

    const emit = (eventName: string, isFocusedAfterwards: boolean) => {
        isNavigatorFocused = isFocusedAfterwards;
        act(() => {
            for (const listener of listeners.get(eventName) ?? []) {
                listener();
            }
        });
    };

    return {
        navigator,
        // The blur listener reads the route the user is heading to, and a central route means the animation is dropped.
        containerRef: createMock<NavigationContainerRef<ParamListBase>>({
            getRootState: () => ({
                key: 'root',
                index: 0,
                routeNames: ['Settings'],
                routes: [{key: 'settings', name: 'Settings'}],
                type: 'stack',
                stale: false,
            }),
        }),
        emitBlur: () => emit('blur', false),
        emitFocus: () => emit('focus', true),
        listenerCount: () => [...listeners.values()].reduce((total, listenersForEvent) => total + listenersForEvent.size, 0),
    };
}

function isAnimationOnScreen(): boolean {
    return screen.queryByTestId('lottie-animation') !== null;
}

describe('Lottie navigation focus under a screen cover', () => {
    beforeEach(() => {
        mockPlay.mockClear();
        mockPause.mockClear();
        mockRecordLottieMount.mockClear();
    });

    it('renders the animation on a normal mount without flipping state or playing by hand', () => {
        const {navigator, containerRef} = createNavigatorStub();

        renderScreenWithCover(
            <NavigationContainerRefContext.Provider value={containerRef}>
                <NavigationContext.Provider value={navigator}>
                    <Lottie
                        source={ANIMATION}
                        autoPlay
                        loop
                    />
                </NavigationContext.Provider>
            </NavigationContainerRefContext.Provider>,
        );

        expect(isAnimationOnScreen()).toBe(true);
        // The key of the player is the navigated-away flag, so a single mount is proof the effect left the state alone.
        expect(mockRecordLottieMount).toHaveBeenCalledTimes(1);
        expect(mockPlay).not.toHaveBeenCalled();
    });

    it('drops the animation on a blur and brings it back on a focus it hears live', () => {
        const {navigator, containerRef, emitBlur, emitFocus} = createNavigatorStub();

        renderScreenWithCover(
            <NavigationContainerRefContext.Provider value={containerRef}>
                <NavigationContext.Provider value={navigator}>
                    <Lottie
                        source={ANIMATION}
                        autoPlay
                        loop
                    />
                </NavigationContext.Provider>
            </NavigationContainerRefContext.Provider>,
        );

        emitBlur();

        expect(isAnimationOnScreen()).toBe(false);

        emitFocus();

        expect(isAnimationOnScreen()).toBe(true);
    });

    it('brings the animation back on reveal when the focus event fired while the screen was covered', async () => {
        const {navigator, containerRef, emitBlur, emitFocus} = createNavigatorStub();

        const home = renderScreenWithCover(
            <NavigationContainerRefContext.Provider value={containerRef}>
                <NavigationContext.Provider value={navigator}>
                    <Lottie
                        source={ANIMATION}
                        autoPlay
                        loop
                    />
                </NavigationContext.Provider>
            </NavigationContainerRefContext.Provider>,
        );

        // This is the real order on a tab switch: the navigator blurs, the cover follows the same event, and the
        // focus on the way back lands before the reveal, which is deferred until the transition ends.
        emitBlur();
        await home.hide();
        emitFocus();
        await home.reveal();

        expect(isAnimationOnScreen()).toBe(true);
    });

    it('leaves the animation dropped when the reveal finds the navigator still blurred', async () => {
        const {navigator, containerRef, emitBlur} = createNavigatorStub();

        const home = renderScreenWithCover(
            <NavigationContainerRefContext.Provider value={containerRef}>
                <NavigationContext.Provider value={navigator}>
                    <Lottie
                        source={ANIMATION}
                        autoPlay
                        loop
                    />
                </NavigationContext.Provider>
            </NavigationContainerRefContext.Provider>,
        );

        emitBlur();
        await home.hide();
        await home.reveal();

        expect(isAnimationOnScreen()).toBe(false);
    });

    it('leaves no navigator listener behind once the screen really unmounts', async () => {
        const {navigator, containerRef, emitBlur, emitFocus, listenerCount} = createNavigatorStub();

        const home = renderScreenWithCover(
            <NavigationContainerRefContext.Provider value={containerRef}>
                <NavigationContext.Provider value={navigator}>
                    <Lottie
                        source={ANIMATION}
                        autoPlay
                        loop
                    />
                </NavigationContext.Provider>
            </NavigationContainerRefContext.Provider>,
        );

        expect(listenerCount()).toBe(2);

        emitBlur();
        await home.hide();
        emitFocus();
        await home.reveal();

        // A hide unsubscribes both listeners and a reveal subscribes them again, so the pair never doubles up.
        expect(listenerCount()).toBe(2);

        home.unmount();

        expect(listenerCount()).toBe(0);
    });
});
