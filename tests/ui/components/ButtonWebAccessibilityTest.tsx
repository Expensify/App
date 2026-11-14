/* eslint-disable testing-library/no-unnecessary-act -- This suite drives a React DOM root directly. */
import {screen} from '@testing-library/dom';

import type ButtonComponent from '@components/Button/Button';
import type WebGenericPressableComponent from '@components/Pressable/GenericPressable/implementation/index';

import CONST from '@src/CONST';

import React, {act} from 'react';
import {createRoot} from 'react-dom/client';
import * as Reanimated from 'react-native-reanimated';

// The native Jest setup caches native components, so reload the real Button with the web adapter and the same React instance.
jest.resetModules();
jest.doMock('react', () => React);
jest.doMock('react-native-reanimated', () => Reanimated);
jest.mock('react-native', () => jest.requireActual<Record<string, unknown>>('react-native-web'));
jest.mock('@components/Pressable/GenericPressable/implementation', () => jest.requireActual<Record<string, unknown>>('@components/Pressable/GenericPressable/implementation/index.tsx'));
jest.mock('@components/OpacityView', () => ({
    __esModule: true,
    default: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
}));
jest.mock('@hooks/useKeyboardShortcut', () => ({__esModule: true, default: () => {}}));
jest.mock('@hooks/useRouteKey', () => ({__esModule: true, default: () => undefined}));
jest.mock('@libs/Accessibility', () => ({
    __esModule: true,
    default: {
        useScreenReaderState: () => 'disabled',
        useAutoHitSlop: () => [undefined, jest.fn()],
    },
}));
jest.mock('@libs/NavigationFocusReturn', () => ({
    registerPressable: () => () => {},
    notifyPressedTrigger: jest.fn(),
}));
jest.mock('@libs/AppState', () => ({__esModule: true, default: () => {}}));

const Button = jest.requireActual<{default: typeof ButtonComponent}>('@components/Button/Button').default;
const WebGenericPressable = jest.requireActual<{default: typeof WebGenericPressableComponent}>('@components/Pressable/GenericPressable/implementation/index.tsx').default;
const CONFIRM_TEXT = 'Sign out on all devices';

describe('Button web accessibility', () => {
    let container: HTMLDivElement;
    let root: ReturnType<typeof createRoot>;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => root.unmount());
        container.remove();
        jest.clearAllMocks();
    });

    const renderButton = async (isPending: boolean) => {
        await act(async () => {
            root.render(
                <Button
                    accessibilityLabel={CONFIRM_TEXT}
                    accessibilityState={{busy: isPending}}
                    isLoading={isPending}
                    sentryLabel={CONST.SENTRY_LABEL.CONFIRM_CONTENT.CONFIRM_BUTTON}
                >
                    <span>{CONFIRM_TEXT}</span>
                </Button>,
            );
        });
    };

    it('exposes pending and retry busy states on the actual DOM button and clears them when loading ends', async () => {
        // Given the same loading and accessibility state supplied by the confirmation, through the real Button and web Pressable
        await renderButton(false);
        expect(screen.getByRole(CONST.ROLE.BUTTON, {name: CONFIRM_TEXT, busy: false}).getAttribute('aria-disabled')).not.toBe('true');

        // When the confirmation begins submitting
        await renderButton(true);

        // Then the actual accessible DOM control announces that it is busy, not merely disabled
        const pendingButton = screen.getByRole(CONST.ROLE.BUTTON, {name: CONFIRM_TEXT, busy: true});
        expect(pendingButton.getAttribute('aria-busy')).toBe('true');
        expect(pendingButton.getAttribute('aria-disabled')).toBe('true');

        // When a failed attempt clears the loading state
        await renderButton(false);

        // Then the same DOM button is no longer busy or disabled, so retry is accessible
        const retryButton = screen.getByRole(CONST.ROLE.BUTTON, {name: CONFIRM_TEXT, busy: false});
        expect(retryButton).toBe(pendingButton);
        expect(retryButton.getAttribute('aria-busy')).toBe('false');
        expect(retryButton.getAttribute('aria-disabled')).not.toBe('true');

        // When a retry begins and then finishes
        await renderButton(true);
        expect(screen.getByRole(CONST.ROLE.BUTTON, {name: CONFIRM_TEXT, busy: true}).getAttribute('aria-busy')).toBe('true');
        await renderButton(false);

        // Then busy clears again rather than remaining stuck after retry
        expect(screen.getByRole(CONST.ROLE.BUTTON, {name: CONFIRM_TEXT, busy: false}).getAttribute('aria-busy')).toBe('false');
    });

    it.each([true, false])('preserves an explicit aria-busy value of %p from an existing pressable consumer', async (busy) => {
        // Given a consumer such as Switch supplies aria-busy directly, even when another state value disagrees
        // When it renders through the real web Pressable
        await act(async () => {
            root.render(
                <WebGenericPressable
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={CONFIRM_TEXT}
                    accessibilityState={{busy: !busy}}
                    aria-busy={busy}
                    sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
                >
                    <span>{CONFIRM_TEXT}</span>
                </WebGenericPressable>,
            );
        });

        // Then the explicit ARIA state still reaches the accessible DOM control
        expect(screen.getByRole(CONST.ROLE.BUTTON, {name: CONFIRM_TEXT, busy}).getAttribute('aria-busy')).toBe(String(busy));
    });
});
