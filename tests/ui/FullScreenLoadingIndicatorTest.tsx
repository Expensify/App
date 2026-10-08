import {act, fireEvent, render, screen} from '@testing-library/react-native';

import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';

import React from 'react';

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
}));

// The nested ActivityIndicator arms its own timer on the same delay; stub the log so advancing
// timers doesn't reach real AppState/network code.
jest.mock('@libs/AppState', () => ({
    __esModule: true,
    default: jest.fn(),
}));

// Render the raw translation keys so assertions don't depend on the copy.
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);

const TIMEOUT = CONST.TIMING.ACTIVITY_INDICATOR_TIMEOUT;

function elapse(milliseconds: number) {
    act(() => {
        jest.advanceTimersByTime(milliseconds);
    });
}

function queryRecoveryUI() {
    return {
        message: screen.queryByText('common.thisIsTakingLongerThanExpected'),
        button: screen.queryByText('common.goBack'),
    };
}

describe('FullScreenLoadingIndicator', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('default behavior (shouldUseGoBackButton omitted)', () => {
        it('shows only the spinner before the timeout elapses', () => {
            // Given a fullscreen loader that does not opt out of the recovery UI
            render(<FullScreenLoadingIndicator />);

            // When not quite the full timeout has passed
            elapse(TIMEOUT - 1);

            // Then the user still sees a plain spinner
            const {message, button} = queryRecoveryUI();
            expect(message).toBeNull();
            expect(button).toBeNull();
        });

        it('grows the timeout message and a Go Back button once the timeout elapses', () => {
            // Given a fullscreen loader that does not opt out of the recovery UI
            render(<FullScreenLoadingIndicator />);

            // When the loader has been up for the full timeout
            elapse(TIMEOUT);

            // Then the trapped user is offered a way out
            const {message, button} = queryRecoveryUI();
            expect(message).not.toBeNull();
            expect(button).not.toBeNull();
        });

        it('navigates back when the Go Back button is pressed', () => {
            // Given a loader that has been up long enough to show the button
            render(<FullScreenLoadingIndicator />);
            elapse(TIMEOUT);

            // When the user presses it
            fireEvent.press(screen.getByText('common.goBack'));

            // Then the app pops the stuck screen
            expect(Navigation.goBack).toHaveBeenCalledTimes(1);
        });

        it('clears its timer on unmount', () => {
            // Given a loader that has armed its recovery timer
            const {unmount} = render(<FullScreenLoadingIndicator />);
            expect(jest.getTimerCount()).toBeGreaterThan(0);

            // When it unmounts before the timer fires
            unmount();

            // Then no timer is left pending. React 18 no longer warns about setState after unmount,
            // so counting timers is the only way to catch a missing clearTimeout.
            expect(jest.getTimerCount()).toBe(0);
        });
    });

    describe('opted out (shouldUseGoBackButton={false})', () => {
        it('never shows the timeout message or the Go Back button', () => {
            // Given a loader on a screen where going back is dead or harmful
            render(<FullScreenLoadingIndicator shouldUseGoBackButton={false} />);

            // When well past the timeout
            elapse(TIMEOUT * 3);

            // Then the recovery UI stays hidden
            const {message, button} = queryRecoveryUI();
            expect(message).toBeNull();
            expect(button).toBeNull();
        });
    });

    describe('explicit opt-in (shouldUseGoBackButton={true})', () => {
        it('behaves the same as the default', () => {
            // Given a call site that still passes the prop explicitly
            render(<FullScreenLoadingIndicator shouldUseGoBackButton />);

            // When the timeout elapses
            elapse(TIMEOUT);

            // Then it matches the new default, which is why the explicit props were removed
            const {message, button} = queryRecoveryUI();
            expect(message).not.toBeNull();
            expect(button).not.toBeNull();
        });
    });
});
