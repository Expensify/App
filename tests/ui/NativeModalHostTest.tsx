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
        jest.replaceProperty(Platform, 'OS', 'android');
        lifecycleEvents.length = 0;
    });

    afterEach(() => {
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
        const nativeShowEvent = {nativeEvent: {}};
        const onShow = jest.fn(() => lifecycleEvents.push('window shown'));
        render(renderHost({onShow}));

        expect(screen.getByTestId('native-modal-window')).toBeOnTheScreen();
        expect(screen.queryByTestId('animated-modal-content')).toBeNull();
        expect(lifecycleEvents).toEqual([]);

        // A timer cannot determine when Android has replaced the activity's dimensions with the dialog's bounds.
        act(() => jest.advanceTimersByTime(1000));
        expect(screen.queryByTestId('animated-modal-content')).toBeNull();

        fireEvent(screen.getByTestId('native-modal-window'), 'show', nativeShowEvent);

        expect(onShow).toHaveBeenCalledWith(nativeShowEvent);
        expect(screen.getByTestId('animated-modal-content')).toBeOnTheScreen();
        expect(lifecycleEvents).toEqual(['window shown', 'content mounted']);
    });

    it('requires a fresh native onShow after every close and reopen', () => {
        const {rerender} = render(renderHost({visible: false}));
        expect(screen.queryByTestId('native-modal-window')).toBeNull();

        for (let cycle = 0; cycle < 5; cycle++) {
            rerender(renderHost({visible: true}));
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
        const {rerender} = render(renderHost({visible: true}));
        fireEvent(screen.getByTestId('native-modal-window'), 'show');

        rerender(renderHost({visible: true, style: {zIndex: 2}}));
        expect(screen.getByTestId('animated-modal-content')).toBeOnTheScreen();
        expect(lifecycleEvents).toEqual(['content mounted']);

        fireEvent(screen.getByTestId('native-modal-window'), 'show');
        expect(lifecycleEvents).toEqual(['content mounted']);
    });

    it('forwards native close requests even before the dialog has shown its content', () => {
        const onRequestClose = jest.fn();
        render(renderHost({visible: true, onRequestClose}));

        fireEvent(screen.getByTestId('native-modal-window'), 'requestClose');
        expect(onRequestClose).toHaveBeenCalledTimes(1);
        expect(screen.queryByTestId('animated-modal-content')).toBeNull();
    });

    it('leaves the default iOS and web host as the native Modal', () => {
        expect(ModalHost).toBe(Modal);
    });
});
