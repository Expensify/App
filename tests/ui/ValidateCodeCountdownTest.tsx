import {act, render, screen} from '@testing-library/react-native';

import ValidateCodeCountdown from '@components/ValidateCodeCountdown';
import type {ValidateCodeCountdownHandle} from '@components/ValidateCodeCountdown/types';

import CONST from '@src/CONST';

import type ReactNative from 'react-native';

import React, {createRef} from 'react';

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string, params?: {timeRemaining?: string; count?: number}) => {
            if (key === 'validateCodeForm.requestNewCodeAccessibilityLabel') {
                return `Request a new code in ${params?.count} seconds`;
            }
            return params?.timeRemaining ?? key;
        },
    })),
);
const mockAnnounce = jest.fn<void, [string, boolean]>();

jest.mock('@hooks/useAccessibilityAnnouncement', () => ({
    __esModule: true,
    default: (message: string, shouldAnnounceMessage: boolean) => mockAnnounce(message, shouldAnnounceMessage),
}));
jest.mock('@components/RenderHTML', () => {
    const ReactMock = jest.requireActual<typeof React>('react');
    const {Text} = jest.requireActual<typeof ReactNative>('react-native');

    return ({html}: {html: string}) => ReactMock.createElement(Text, null, html.replaceAll(/<[^>]*>/g, ''));
});

const BASE_TIME = new Date('2026-08-21T10:00:00.000Z').valueOf();

function announcedMessages() {
    return mockAnnounce.mock.calls.filter(([, shouldAnnounceMessage]) => shouldAnnounceMessage).map(([message]) => message);
}

// One act per tick so React commits each second; batching them skips the intermediate values.
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

function renderCountdown(onCountdownFinish: () => void = jest.fn(), requestedAt?: number) {
    const ref = createRef<ValidateCodeCountdownHandle>();
    render(
        <ValidateCodeCountdown
            ref={ref}
            requestedAt={requestedAt}
            onCountdownFinish={onCountdownFinish}
        />,
    );
    return ref;
}

describe('ValidateCodeCountdown', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(BASE_TIME);
        mockAnnounce.mockClear();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('reports the time that actually elapsed after the timer was starved of callbacks', () => {
        renderCountdown();
        expect(screen.getByText('00:30', {includeHiddenElements: true})).toBeOnTheScreen();

        tickSeconds(3);
        expect(screen.getByText('00:27', {includeHiddenElements: true})).toBeOnTheScreen();

        // 14s of the 30s window are gone once the single resume callback lands.
        suspendFor(10 * CONST.MILLISECONDS_PER_SECOND);
        expect(screen.getByText('00:16', {includeHiddenElements: true})).toBeOnTheScreen();
    });

    it('finishes once the window has elapsed even if the callbacks never arrived', () => {
        const onCountdownFinish = jest.fn();
        renderCountdown(onCountdownFinish);

        suspendFor(CONST.REQUEST_CODE_DELAY * CONST.MILLISECONDS_PER_SECOND);
        expect(onCountdownFinish).toHaveBeenCalled();
    });

    it('keeps measuring from a persisted requestedAt when one is passed', () => {
        renderCountdown(jest.fn(), BASE_TIME - 8 * CONST.MILLISECONDS_PER_SECOND);
        expect(screen.getByText('00:22', {includeHiddenElements: true})).toBeOnTheScreen();

        suspendFor(10 * CONST.MILLISECONDS_PER_SECOND);
        expect(screen.getByText('00:11', {includeHiddenElements: true})).toBeOnTheScreen();
    });

    // A backward clock correction leaves the anchor in the future, where the clamp returns the same value every tick.
    it('keeps ticking to zero when the clock is corrected backward', () => {
        const onCountdownFinish = jest.fn();
        renderCountdown(onCountdownFinish, BASE_TIME + 10 * CONST.MILLISECONDS_PER_SECOND);
        expect(screen.getByText('00:30', {includeHiddenElements: true})).toBeOnTheScreen();

        tickSeconds(45);
        expect(onCountdownFinish).toHaveBeenCalled();
    });

    it('announces the milestones a ticking countdown passes through', () => {
        renderCountdown();

        tickSeconds(CONST.REQUEST_CODE_DELAY);
        expect(announcedMessages()).toEqual(['validateCodeForm.timeRemainingAnnouncement', 'validateCodeForm.timeRemainingAnnouncement', 'validateCodeForm.timeExpiredAnnouncement']);
    });

    // Recomputing skips values, so an exact-match gate would ask for nothing at all about a window that expired.
    it('asks for the expiry announcement when the countdown skips straight to zero', () => {
        renderCountdown();

        suspendFor(CONST.REQUEST_CODE_DELAY * CONST.MILLISECONDS_PER_SECOND);
        expect(announcedMessages()).toContain('validateCodeForm.timeExpiredAnnouncement');
    });

    it('measures from the resend time after the countdown is reset', () => {
        const ref = renderCountdown();

        tickSeconds(5);
        act(() => ref.current?.resetCountdown());
        expect(screen.getByText('00:30', {includeHiddenElements: true})).toBeOnTheScreen();

        suspendFor(10 * CONST.MILLISECONDS_PER_SECOND);
        expect(screen.getByText('00:19', {includeHiddenElements: true})).toBeOnTheScreen();
    });

    it('reads as one disabled element with the full sentence, so screen readers do not offer a link named only by the time', () => {
        // Given the countdown has been running for a few seconds
        renderCountdown();
        tickSeconds(4);

        // When a screen reader reaches it
        const countdown = screen.getByLabelText('Request a new code in 26 seconds');

        // Then it says what the time is for and that it can't be used yet
        expect(countdown).toBeDisabled();

        // And the time inside stays on screen but is hidden from screen readers, so Android doesn't offer it as its own link
        expect(screen.queryByText('00:26')).not.toBeOnTheScreen();
        expect(screen.getByText('00:26', {includeHiddenElements: true})).toBeOnTheScreen();

        // When the next second passes
        tickSeconds(1);

        // Then the sentence keeps up with the visible time
        expect(screen.getByLabelText('Request a new code in 25 seconds')).toBeOnTheScreen();
    });
});
