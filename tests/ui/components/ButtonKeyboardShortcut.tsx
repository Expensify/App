import {NavigationContainer} from '@react-navigation/native';
import {render} from '@testing-library/react-native';
import React from 'react';
import ButtonKeyboardShortcut from '@src/components/ButtonComposed/primitives/ButtonKeyboardShortcut';
import type {ButtonKeyboardShortcutProps} from '@src/components/ButtonComposed/types';

// ── Keyboard-shortcut wiring ───────────────────────────────────────────────────
//
// react-native-key-command is a no-op in tests so dispatching real keyboard
// events does not reach registered handlers. Instead the mock below captures
// the callback and config that ButtonKeyboardShortcut passes to
// useKeyboardShortcut, letting tests invoke the callback directly — the same
// pattern used across the ButtonComposed test suite.
let enterKeyCallback: ((event?: KeyboardEvent) => void) | undefined;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let capturedShortcutConfig: Record<string, any> | undefined;

jest.mock('@hooks/useKeyboardShortcut', () =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (shortcut: {shortcutKey: string}, callback: (e?: KeyboardEvent) => void, config: Record<string, any> = {}) => {
        if (shortcut.shortcutKey !== 'Enter' || !config.isActive) {
            return;
        }
        enterKeyCallback = callback;
        capturedShortcutConfig = config;
    },
);
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Renders ButtonKeyboardShortcut inside a NavigationContainer.
 * NavigationContainer is required because the component calls useIsFocused().
 * isPressOnEnterActive=true is the default here so the shortcut is active
 * even without a focused screen, keeping individual tests simple.
 */
const renderShortcut = (props: Partial<ButtonKeyboardShortcutProps> = {}) =>
    render(
        <NavigationContainer>
            <ButtonKeyboardShortcut
                pressOnEnter
                isPressOnEnterActive
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        </NavigationContainer>,
    );

describe('ButtonKeyboardShortcut', () => {
    beforeEach(() => {
        enterKeyCallback = undefined;
        capturedShortcutConfig = undefined;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // ── Registration ───────────────────────────────────────────────────────────

    describe('registration', () => {
        it('registers an Enter listener when pressOnEnter is true', () => {
            // Given a ButtonKeyboardShortcut with pressOnEnter enabled
            renderShortcut({pressOnEnter: true});

            // Then useKeyboardShortcut was called and the callback was captured
            expect(enterKeyCallback).toBeDefined();
        });

        it('does not register an Enter listener when pressOnEnter is false', () => {
            // Given a ButtonKeyboardShortcut with pressOnEnter disabled
            renderShortcut({pressOnEnter: false});

            // Then no callback was registered (mock guards on config.isActive)
            expect(enterKeyCallback).toBeUndefined();
        });

        it('does not register an Enter listener when pressOnEnter is omitted', () => {
            // Given a ButtonKeyboardShortcut without pressOnEnter
            renderShortcut({pressOnEnter: undefined});

            // Then no callback was registered
            expect(enterKeyCallback).toBeUndefined();
        });
    });

    // ── onPress invocation ─────────────────────────────────────────────────────

    describe('onPress invocation', () => {
        it('calls onPress when Enter is triggered and the button is enabled', () => {
            // Given an active shortcut with an onPress handler
            const onPress = jest.fn();
            renderShortcut({onPress});

            // When the Enter key fires
            enterKeyCallback?.(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));

            // Then onPress is called exactly once
            expect(onPress).toHaveBeenCalledTimes(1);
        });

        it('blocks onPress when isDisabled is true', () => {
            // Given a shortcut where the button is disabled
            const onPress = jest.fn();
            renderShortcut({onPress, isDisabled: true});

            // When the Enter key fires
            enterKeyCallback?.(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));

            // Then validateSubmitShortcut blocks the call
            expect(onPress).not.toHaveBeenCalled();
        });

        it('blocks onPress when isLoading is true', () => {
            // Given a shortcut where the button is loading
            const onPress = jest.fn();
            renderShortcut({onPress, isLoading: true});

            // When the Enter key fires
            enterKeyCallback?.(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));

            // Then validateSubmitShortcut blocks the call
            expect(onPress).not.toHaveBeenCalled();
        });
    });

    // ── Shortcut config ────────────────────────────────────────────────────────

    describe('shortcut config', () => {
        it('forwards allowBubble as shouldBubble', () => {
            // Given a shortcut configured to allow event bubbling
            renderShortcut({allowBubble: true});

            // Then the config passed to useKeyboardShortcut reflects shouldBubble=true
            expect(capturedShortcutConfig?.shouldBubble).toBe(true);
        });

        it('forwards enterKeyEventListenerPriority as priority', () => {
            // Given a shortcut with a custom listener priority
            renderShortcut({enterKeyEventListenerPriority: 5});

            // Then the config reflects the custom priority
            expect(capturedShortcutConfig?.priority).toBe(5);
        });

        it('is active when isPressOnEnterActive is true regardless of screen focus', () => {
            // Given a shortcut that should be active even when the screen is not focused
            renderShortcut({isPressOnEnterActive: true});

            // Then the callback was captured — the shortcut is active
            expect(enterKeyCallback).toBeDefined();
        });

        it('sets shouldPreventDefault to false', () => {
            // The shortcut must not swallow the event so other listeners can still react.
            renderShortcut();

            expect(capturedShortcutConfig?.shouldPreventDefault).toBe(false);
        });
    });

    // ── Rendering ──────────────────────────────────────────────────────────────

    it('renders nothing to the DOM', () => {
        // Given a rendered ButtonKeyboardShortcut
        const {toJSON} = renderShortcut();

        // Then it contributes no nodes to the render tree
        expect(toJSON()).toBeNull();
    });
});
