import {act, render, screen} from '@testing-library/react-native';

import ValidateCodeCountdown from '@components/ValidateCodeCountdown';

import CONST from '@src/CONST';

import type ReactNative from 'react-native';

import React from 'react';

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string, params?: {timeRemaining?: string}) => params?.timeRemaining ?? key,
    })),
);
jest.mock('@hooks/useAccessibilityAnnouncement', () => jest.fn());
jest.mock('@components/RenderHTML', () => {
    const ReactMock = jest.requireActual<typeof React>('react');
    const {Text} = jest.requireActual<typeof ReactNative>('react-native');

    return ({html}: {html: string}) => ReactMock.createElement(Text, null, html.replaceAll(/<[^>]*>/g, ''));
});

const BASE_TIME = new Date('2026-08-21T10:00:00.000Z').valueOf();

// One act per tick so React commits the effect that schedules the next one.
function tickSeconds(seconds: number) {
    for (let i = 0; i < seconds; i++) {
        act(() => jest.advanceTimersByTime(CONST.MILLISECONDS_PER_SECOND));
    }
}

// Clock advances with no callback delivered, the way a throttled tab or a backgrounded app behaves.
function suspendFor(milliseconds: number) {
    act(() => {
        jest.setSystemTime(Date.now() + milliseconds);
        jest.advanceTimersByTime(CONST.MILLISECONDS_PER_SECOND);
    });
}

describe('ValidateCodeCountdown', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(BASE_TIME);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('reports the time that actually elapsed after the timer was starved of callbacks', () => {
        render(<ValidateCodeCountdown onCountdownFinish={jest.fn()} />);
        expect(screen.getByText('00:30')).toBeOnTheScreen();

        tickSeconds(3);
        expect(screen.getByText('00:27')).toBeOnTheScreen();

        // 14s of the 30s window are gone once the single resume callback lands.
        suspendFor(10 * CONST.MILLISECONDS_PER_SECOND);
        expect(screen.getByText('00:16')).toBeOnTheScreen();
    });

    it('finishes once the window has elapsed even if the callbacks never arrived', () => {
        const onCountdownFinish = jest.fn();
        render(<ValidateCodeCountdown onCountdownFinish={onCountdownFinish} />);

        suspendFor(CONST.REQUEST_CODE_DELAY * CONST.MILLISECONDS_PER_SECOND);
        expect(onCountdownFinish).toHaveBeenCalled();
    });

    it('keeps measuring from a persisted requestedAt when one is passed', () => {
        render(
            <ValidateCodeCountdown
                requestedAt={BASE_TIME - 8 * CONST.MILLISECONDS_PER_SECOND}
                onCountdownFinish={jest.fn()}
            />,
        );
        expect(screen.getByText('00:22')).toBeOnTheScreen();

        suspendFor(10 * CONST.MILLISECONDS_PER_SECOND);
        expect(screen.getByText('00:11')).toBeOnTheScreen();
    });
});
