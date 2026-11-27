/** Keeps menu success feedback tied to the action result, including asynchronous clipboard writes. */
import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ContextMenuItem from '@components/ContextMenuItem';

import CONST from '@src/CONST';

import React from 'react';
// eslint-disable-next-line no-restricted-imports -- Native primitives keep the mocked menu leaves independent of the App UI dependencies.
import {Pressable as MockPressable, Text as MockText} from 'react-native';

jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useStyleUtils', () => () => ({getContextMenuItemStyles: () => [], getIconFillColor: () => ''}));
jest.mock('@hooks/useWindowDimensions', () => () => ({windowWidth: 1024}));
jest.mock('@components/Icon', () => () => null);

jest.mock('@components/FocusableMenuItem', () => {
    function MockFocusableMenuItem({title, onPress}: {title: string; onPress: () => void}) {
        return (
            <MockPressable onPress={onPress}>
                <MockText>{title}</MockText>
            </MockPressable>
        );
    }
    return MockFocusableMenuItem;
});

jest.mock('@components/BaseMiniContextMenuItem', () => {
    function MockBaseMiniContextMenuItem({tooltipText, onPress}: {tooltipText: string; onPress: () => void}) {
        return (
            <MockPressable onPress={onPress}>
                <MockText>{tooltipText}</MockText>
            </MockPressable>
        );
    }
    return MockBaseMiniContextMenuItem;
});

function MockIcon() {
    return null;
}

describe.each([false, true])('ContextMenuItem (mini: %s)', (isMini) => {
    it.each(['false', 'rejection'])('withholds pending feedback and allows immediate retry after %s', async (failure) => {
        // Given an action whose result is not yet known
        const {promise, resolve, reject} = Promise.withResolvers<boolean>();
        const onPress = jest.fn().mockReturnValueOnce(promise).mockResolvedValueOnce(true);
        render(
            <ContextMenuItem
                icon={MockIcon}
                text="Copy"
                successText="Copied!"
                onPress={onPress}
                isMini={isMini}
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
            />,
        );

        // When the item receives duplicate presses before the clipboard completes
        fireEvent.press(screen.getByText('Copy'));
        fireEvent.press(screen.getByText('Copy'));

        // Then the action runs once and no success feedback appears prematurely
        expect(onPress).toHaveBeenCalledTimes(1);
        expect(screen.queryByText('Copied!')).toBeNull();

        // When the copy fails and the user retries immediately
        await act(async () => {
            if (failure === 'rejection') {
                reject(new Error('Clipboard unavailable'));
            } else {
                resolve(false);
            }
        });
        expect(screen.queryByText('Copied!')).toBeNull();
        fireEvent.press(screen.getByText('Copy'));
        await act(() => Promise.resolve());

        // Then only the successful retry shows confirmation and throttles further presses
        expect(onPress).toHaveBeenCalledTimes(2);
        expect(screen.getByText('Copied!')).toBeTruthy();
        fireEvent.press(screen.getByText('Copied!'));
        expect(onPress).toHaveBeenCalledTimes(2);
    });

    it('shows success only after a pending action succeeds', async () => {
        // Given a clipboard write still in progress
        const {promise, resolve} = Promise.withResolvers<boolean>();
        render(
            <ContextMenuItem
                icon={MockIcon}
                text="Copy"
                successText="Copied!"
                onPress={() => promise}
                isMini={isMini}
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
            />,
        );

        // When copying starts, then its confirmation must wait for the result
        fireEvent.press(screen.getByText('Copy'));
        expect(screen.queryByText('Copied!')).toBeNull();

        // When copying completes successfully, then confirmation is shown
        await act(async () => resolve(true));
        expect(screen.getByText('Copied!')).toBeTruthy();
    });

    it('preserves success feedback for synchronous void actions and forwards the event', async () => {
        // Given an existing action that does not return a result
        const onPress = jest.fn();
        const event = {nativeEvent: {}};
        render(
            <ContextMenuItem
                icon={MockIcon}
                text="Copy"
                successText="Copied!"
                onPress={onPress}
                isMini={isMini}
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
            />,
        );

        // When the item is pressed
        fireEvent.press(screen.getByText('Copy'), event);
        await act(() => Promise.resolve());

        // Then void remains compatible with the previous success behavior
        expect(onPress).toHaveBeenCalledWith(event);
        expect(screen.getByText('Copied!')).toBeTruthy();
    });

    it('does not throttle successful actions without a success icon or text', async () => {
        // Given an ordinary menu action without success feedback
        const onPress = jest.fn(() => true);
        render(
            <ContextMenuItem
                icon={MockIcon}
                text="Open"
                onPress={onPress}
                isMini={isMini}
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
            />,
        );

        // When it is pressed twice after each action finishes
        fireEvent.press(screen.getByText('Open'));
        await act(() => Promise.resolve());
        fireEvent.press(screen.getByText('Open'));
        await act(() => Promise.resolve());

        // Then the success-feedback throttle does not suppress the second action
        expect(onPress).toHaveBeenCalledTimes(2);
    });
});
