import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ModalHost from '@components/Modal/ReanimatedModal/ModalHost';
import AndroidModalHost from '@components/Modal/ReanimatedModal/ModalHost/index.android';

import type {ModalProps} from 'react-native';

import React, {useLayoutEffect} from 'react';
import {Modal, Platform, View} from 'react-native';

const lifecycleEvents: string[] = [];

function AnimatedContent() {
    useLayoutEffect(() => {
        lifecycleEvents.push('content mounted');
        return () => {
            lifecycleEvents.push('content unmounted');
        };
    }, []);

    return <View testID="animated-modal-content" />;
}

describe('Android modal window readiness', () => {
    beforeEach(() => {
        // Global setup restores real timers, so install the clock here to exercise delayed mounting regressions.
        jest.useFakeTimers();
        jest.replaceProperty(Platform, 'OS', 'android');
        lifecycleEvents.length = 0;
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    function renderHost(props: Partial<ModalProps> = {}) {
        return (
            <AndroidModalHost
                testID="native-modal-window"
                transparent
                onRequestClose={jest.fn()}
                {...props}
            >
                <AnimatedContent />
            </AndroidModalHost>
        );
    }

    it('waits for native onShow before mounting children that start entering animations', () => {
        // Given entering animations must not measure the activity window before Android finishes creating the dialog
        const nativeShowEvent = {nativeEvent: {}};
        const onShow = jest.fn(() => lifecycleEvents.push('window shown'));
        render(renderHost({onShow}));

        expect(screen.getByTestId('native-modal-window')).toBeOnTheScreen();
        expect(screen.queryByTestId('animated-modal-content')).toBeNull();
        expect(lifecycleEvents).toEqual([]);

        // When enough time passes for a timer-based workaround, but the native window is still not ready
        act(() => jest.advanceTimersByTime(1000));
        // Then elapsed time alone must not mount content against the activity's dimensions
        expect(screen.queryByTestId('animated-modal-content')).toBeNull();

        // When Android confirms the dialog's bounds are ready
        fireEvent(screen.getByTestId('native-modal-window'), 'show', nativeShowEvent);

        // Then the caller receives that event before child animations can begin measuring the dialog
        expect(onShow).toHaveBeenCalledWith(nativeShowEvent);
        expect(screen.getByTestId('animated-modal-content')).toBeOnTheScreen();
        expect(lifecycleEvents).toEqual(['window shown', 'content mounted']);
    });

    it('requires a fresh native onShow after every close and reopen', () => {
        // Given a closed dialog must not reuse a previous window's readiness
        const {rerender} = render(renderHost({visible: false}));
        expect(screen.queryByTestId('native-modal-window')).toBeNull();

        for (let cycle = 0; cycle < 5; cycle++) {
            // When repeated openings create new native windows
            rerender(renderHost({visible: true}));
            // Then each opening must wait for its own onShow instead of starting animations with stale bounds
            expect(screen.queryByTestId('animated-modal-content')).toBeNull();
            expect(lifecycleEvents.filter((event) => event === 'content mounted')).toHaveLength(cycle);

            fireEvent(screen.getByTestId('native-modal-window'), 'show');
            expect(screen.getByTestId('animated-modal-content')).toBeOnTheScreen();
            expect(lifecycleEvents.filter((event) => event === 'content mounted')).toHaveLength(cycle + 1);

            rerender(renderHost({visible: false}));
            expect(screen.queryByTestId('native-modal-window')).toBeNull();
            expect(screen.queryByTestId('animated-modal-content')).toBeNull();
            expect(lifecycleEvents.filter((event) => event === 'content unmounted')).toHaveLength(cycle + 1);
        }
    });

    it('preserves content across updates while the same native dialog remains open', () => {
        // Given a shown dialog already has valid bounds for its mounted content
        const {rerender} = render(renderHost({visible: true}));
        fireEvent(screen.getByTestId('native-modal-window'), 'show');

        // When unrelated props change without replacing the native window
        rerender(renderHost({visible: true, style: {zIndex: 2}}));
        // Then content must stay mounted so updates do not restart entering animations
        expect(screen.getByTestId('animated-modal-content')).toBeOnTheScreen();
        expect(lifecycleEvents).toEqual(['content mounted']);

        fireEvent(screen.getByTestId('native-modal-window'), 'show');
        expect(lifecycleEvents).toEqual(['content mounted']);
    });

    it('forwards native close requests even before the dialog has shown its content', () => {
        // Given Android can request dismissal before the window is ready for child animations
        const onRequestClose = jest.fn();
        render(renderHost({visible: true, onRequestClose}));

        // When a native close request arrives during that waiting period
        fireEvent(screen.getByTestId('native-modal-window'), 'requestClose');
        // Then readiness gating must not trap the user in an empty dialog
        expect(onRequestClose).toHaveBeenCalledTimes(1);
        expect(screen.queryByTestId('animated-modal-content')).toBeNull();
    });

    it('leaves the default iOS and web host as the native Modal', () => {
        // Given the readiness delay addresses Android's initial activity-window measurements only
        // When the default host is resolved for the other platforms
        // Then it must remain the native Modal rather than adding an unnecessary content delay
        expect(ModalHost).toBe(Modal);
    });
});
