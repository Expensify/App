import {cleanup, render} from '@testing-library/react-native';

import {bottomTabScreenLayoutWrapper as ScreenLayout} from '@libs/Navigation/PlatformStackNavigation/ScreenLayout';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import {DefaultTheme} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';

jest.mock('@libs/Log', () => ({info: jest.fn(), warn: jest.fn()}));

function createNavigation() {
    const listeners = {
        transitionStart: new Set<() => void>(),
        transitionEnd: new Set<() => void>(),
    };

    return {
        listeners,
        addListener: (type: keyof typeof listeners, callback: () => void) => {
            listeners[type].add(callback);
            return () => {
                listeners[type].delete(callback);
            };
        },
        emit: (type: keyof typeof listeners) => {
            for (const callback of listeners[type]) {
                callback();
            }
        },
    };
}

function renderScreen(navigation: ReturnType<typeof createNavigation>) {
    return render(
        <ScreenLayout
            navigation={navigation}
            route={{key: 'screen', name: 'screen'}}
            options={{}}
            theme={DefaultTheme}
        >
            <View />
        </ScreenLayout>,
    );
}

describe('ScreenLayout transition tracking', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        cleanup();
        jest.runAllTimers();
        jest.useRealTimers();
    });

    it('releases deferred work when the replacement animation ends without an interrupted completion', () => {
        // Given work waiting for a screen animation that will be interrupted
        const navigation = createNavigation();
        renderScreen(navigation);
        navigation.emit('transitionStart');
        const callback = jest.fn();
        TransitionTracker.runAfterTransitions({callback});

        // When a replacement animation starts, the JS stack suppresses the interrupted animation's end
        navigation.emit('transitionStart');
        navigation.emit('transitionStart');

        // Then deferred work cannot slip through a gap between the interrupted and replacement animations
        expect(callback).not.toHaveBeenCalled();

        // When only the replacement animation completes, as it does in Card.tsx
        navigation.emit('transitionEnd');

        // Then work is released immediately rather than waiting for the tracker's safety timeout
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('tracks a subsequent transition after an interrupted sequence has settled', () => {
        // Given a screen that stayed mounted after its interrupted transition settled
        const navigation = createNavigation();
        renderScreen(navigation);
        navigation.emit('transitionStart');
        navigation.emit('transitionStart');
        navigation.emit('transitionEnd');

        // When another transition starts, new work must wait for that animation
        navigation.emit('transitionStart');
        const callback = jest.fn();
        TransitionTracker.runAfterTransitions({callback});
        expect(callback).not.toHaveBeenCalled();
        navigation.emit('transitionEnd');

        // Then the new transition has its own live handle and releases work on completion
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('keeps concurrent screens active independently when one interrupted transition settles', () => {
        // Given two screens animating concurrently, with the first screen changing direction
        const firstNavigation = createNavigation();
        const secondNavigation = createNavigation();
        renderScreen(firstNavigation);
        renderScreen(secondNavigation);
        firstNavigation.emit('transitionStart');
        secondNavigation.emit('transitionStart');
        firstNavigation.emit('transitionStart');
        const callback = jest.fn();
        TransitionTracker.runAfterTransitions({callback});

        // When the first screen settles, the second screen still owns its transition
        firstNavigation.emit('transitionEnd');
        expect(callback).not.toHaveBeenCalled();

        // When the second screen settles, no interrupted transition should be left behind
        secondNavigation.emit('transitionEnd');

        // Then deferred work is released only after both screens have finished
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('removes listeners and releases an interrupted transition one frame after unmount', () => {
        // Given a screen removed before its replacement animation can finish
        const navigation = createNavigation();
        const {unmount} = renderScreen(navigation);
        navigation.emit('transitionStart');
        navigation.emit('transitionStart');
        const callback = jest.fn();
        TransitionTracker.runAfterTransitions({callback});

        // When it unmounts, cleanup leaves one frame for an incoming screen to register
        unmount();
        expect(navigation.listeners.transitionStart.size).toBe(0);
        expect(navigation.listeners.transitionEnd.size).toBe(0);
        expect(callback).not.toHaveBeenCalled();
        jest.advanceTimersByTime(16);

        // Then cleanup releases its handle without requiring a missing transitionEnd or the safety timeout
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('does not release an incoming screen when the outgoing screen cleans up', () => {
        // Given an outgoing screen unmounting mid-animation with deferred work still waiting
        const outgoingNavigation = createNavigation();
        const outgoingScreen = renderScreen(outgoingNavigation);
        outgoingNavigation.emit('transitionStart');
        outgoingNavigation.emit('transitionStart');
        const callback = jest.fn();
        TransitionTracker.runAfterTransitions({callback});
        outgoingScreen.unmount();

        // When the incoming screen registers before the outgoing screen's deferred cleanup
        const incomingNavigation = createNavigation();
        renderScreen(incomingNavigation);
        incomingNavigation.emit('transitionStart');
        jest.advanceTimersByTime(16);

        // Then cleanup cannot release work while the incoming animation is still running
        expect(callback).not.toHaveBeenCalled();
        incomingNavigation.emit('transitionEnd');
        expect(callback).toHaveBeenCalledTimes(1);
    });
});
