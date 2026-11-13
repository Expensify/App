import {act, renderHook} from '@testing-library/react-native';

import useReopenAfterReturn from '@hooks/useReopenAfterReturn';
import type {UseReopenAfterReturnParams} from '@hooks/useReopenAfterReturn';

import type TransitionTracker from '@libs/Navigation/TransitionTracker';

import type React from 'react';

// Mirrors `useFocusEffect`: runs the effect while the screen is focused, and again whenever the effect changes.
let mockIsFocused = true;
jest.mock('@react-navigation/native', () => {
    const {useEffect} = jest.requireActual<typeof React>('react');
    return {
        ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
        useIsFocused: () => mockIsFocused,
        useFocusEffect: (effect: () => void | (() => void)) => {
            const isFocused = mockIsFocused;
            useEffect(() => (isFocused ? effect() : undefined), [effect, isFocused]);
        },
    };
});

// Run the post-transition work right away, since no screen actually animates in a unit test.
jest.mock('@libs/Navigation/TransitionTracker', () => ({
    runAfterTransitions: ({callback}: Parameters<typeof TransitionTracker.runAfterTransitions>[0]): ReturnType<typeof TransitionTracker.runAfterTransitions> => {
        callback();
        return {cancel: () => {}};
    },
}));

type Props = Omit<UseReopenAfterReturnParams, 'onReturn'>;

describe('useReopenAfterReturn', () => {
    let onReturn: jest.Mock;

    const renderReopen = (initialProps: Props = {}) => renderHook((props: Props) => useReopenAfterReturn({onReturn, ...props}), {initialProps});

    // Leaves the screen and comes back, re-rendering with each focus change the way navigation would.
    const leaveAndReturn = (rerender: (props: Props) => void, props: Props = {}) => {
        mockIsFocused = false;
        rerender(props);
        mockIsFocused = true;
        rerender(props);
    };

    beforeEach(() => {
        mockIsFocused = true;
        onReturn = jest.fn();
    });

    it('runs once the user comes back from the screen they were sent to', () => {
        // Given a screen that is about to send the user elsewhere
        const {result, rerender} = renderReopen();
        act(() => result.current.setIsDeparting(true));

        // When the user leaves and comes back
        leaveAndReturn(rerender);

        // Then the return runs, and only once
        expect(onReturn).toHaveBeenCalledTimes(1);
        leaveAndReturn(rerender);
        expect(onReturn).toHaveBeenCalledTimes(1);
    });

    it('does nothing for a focus it did not send the user away for', () => {
        // Given a screen that never marked a departure
        const {rerender} = renderReopen();

        // When the user leaves and comes back on their own
        leaveAndReturn(rerender);

        // Then nothing reopens
        expect(onReturn).not.toHaveBeenCalled();
    });

    it('drops the return when the user comes back without what it needs', () => {
        // Given a screen that sent the user away
        const {result, rerender} = renderReopen();
        act(() => result.current.setIsDeparting(true));

        // When they come back in a state the return can't use, and later return again once it could
        leaveAndReturn(rerender, {shouldCancel: true});
        leaveAndReturn(rerender);

        // Then nothing reopens, since the first return already dropped it
        expect(onReturn).not.toHaveBeenCalled();
    });

    it('waits on the screen until it can reopen, but not past leaving it again', () => {
        // Given a screen that sent the user away, and comes back before it can reopen
        const {result, rerender} = renderReopen();
        act(() => result.current.setIsDeparting(true));
        leaveAndReturn(rerender, {canReopen: false});
        expect(onReturn).not.toHaveBeenCalled();

        // When the user leaves again for something unrelated, and comes back once it could reopen
        leaveAndReturn(rerender, {canReopen: true});

        // Then nothing reopens, since that later focus was not the return it was waiting for
        expect(onReturn).not.toHaveBeenCalled();
    });

    it('reopens as soon as it can while the user is still back on the screen', () => {
        // Given a screen the user came back to before it could reopen
        const {result, rerender} = renderReopen();
        act(() => result.current.setIsDeparting(true));
        leaveAndReturn(rerender, {canReopen: false});

        // When it becomes able to while still focused
        rerender({canReopen: true});

        // Then the return runs
        expect(onReturn).toHaveBeenCalledTimes(1);
    });

    it('does nothing once a departure that never left the screen is disarmed', () => {
        // Given a screen that armed a return, but whose navigation never took the user away
        const {result, rerender} = renderReopen();
        act(() => result.current.setIsDeparting(true));

        // When the next press stays on the screen and disarms it, and the user later leaves and comes back for something else
        act(() => result.current.setIsDeparting(false));
        leaveAndReturn(rerender);

        // Then nothing reopens on that unrelated trip
        expect(onReturn).not.toHaveBeenCalled();
    });
});
