/**
 * @jest-environment jsdom
 */
import {act, render, screen} from '@testing-library/react-native';

import Presence, {usePresence} from '@components/Overlay/Presence';
import Text from '@components/Text';

import React, {useEffect} from 'react';

const capturedOnAnimationEnd: {current: (() => void) | undefined} = {current: undefined};

function Content() {
    const {actions} = usePresence('<Content>');
    useEffect(() => {
        capturedOnAnimationEnd.current = actions.onAnimationEnd;
    }, [actions.onAnimationEnd]);
    return <Text>content</Text>;
}

beforeEach(() => {
    jest.useFakeTimers();
    capturedOnAnimationEnd.current = undefined;
});

afterEach(() => {
    jest.useRealTimers();
});

describe('Presence', () => {
    it('keeps children mounted through the exit, then unmounts and fires onExitComplete on animation end', () => {
        const onExitComplete = jest.fn();
        const {rerender} = render(
            <Presence
                present
                onExitComplete={onExitComplete}
            >
                <Content />
            </Presence>,
        );
        expect(screen.getByText('content')).toBeTruthy();

        rerender(
            <Presence
                present={false}
                onExitComplete={onExitComplete}
            >
                <Content />
            </Presence>,
        );
        expect(screen.getByText('content')).toBeTruthy();
        expect(onExitComplete).not.toHaveBeenCalled();

        act(() => capturedOnAnimationEnd.current?.());
        expect(screen.queryByText('content')).toBeNull();
        expect(onExitComplete).toHaveBeenCalledTimes(1);
    });

    it('force-unmounts via the 2s fallback when onAnimationEnd never fires', () => {
        const onExitComplete = jest.fn();
        const {rerender} = render(
            <Presence
                present
                onExitComplete={onExitComplete}
            >
                <Content />
            </Presence>,
        );
        rerender(
            <Presence
                present={false}
                onExitComplete={onExitComplete}
            >
                <Content />
            </Presence>,
        );
        act(() => jest.advanceTimersByTime(2000));
        expect(onExitComplete).toHaveBeenCalledTimes(1);
        expect(screen.queryByText('content')).toBeNull();
    });

    it('scales the fallback with exitDurationMs so a >2s exit is not truncated', () => {
        const onExitComplete = jest.fn();
        const {rerender} = render(
            <Presence
                present
                exitDurationMs={3000}
                onExitComplete={onExitComplete}
            >
                <Content />
            </Presence>,
        );
        rerender(
            <Presence
                present={false}
                exitDurationMs={3000}
                onExitComplete={onExitComplete}
            >
                <Content />
            </Presence>,
        );
        // The old fixed 2s cap would have force-completed here; the fallback is now 3000 + safety margin.
        act(() => jest.advanceTimersByTime(2000));
        expect(onExitComplete).not.toHaveBeenCalled();
        act(() => jest.advanceTimersByTime(2000));
        expect(onExitComplete).toHaveBeenCalledTimes(1);
    });

    it('fires onExitComplete at most once when the animation end and the fallback timer race', () => {
        const onExitComplete = jest.fn();
        const {rerender} = render(
            <Presence
                present
                onExitComplete={onExitComplete}
            >
                <Content />
            </Presence>,
        );
        rerender(
            <Presence
                present={false}
                onExitComplete={onExitComplete}
            >
                <Content />
            </Presence>,
        );
        act(() => capturedOnAnimationEnd.current?.());
        act(() => jest.advanceTimersByTime(2000));
        expect(onExitComplete).toHaveBeenCalledTimes(1);
    });
});
