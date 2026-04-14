import {NavigationContainer} from '@react-navigation/native';
import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {ActivityIndicator as RNActivityIndicator, StyleSheet, Text, View} from 'react-native';
import HapticFeedback from '@libs/HapticFeedback';
import colors from '@styles/theme/colors';
import variables from '@styles/variables';
import Button from '@src/components/ButtonComposed/Button';
import {useButtonContext} from '@src/components/ButtonComposed/context';
import type {ButtonVariant} from '@src/components/ButtonComposed/context';
import type {ButtonProps} from '@src/components/ButtonComposed/types';
import CONST from '@src/CONST';

// ── pressOnEnter / keyboard-shortcut wiring ────────────────────────────────────
//
// react-native-key-command is mocked to a no-op in tests, so keyboard events
// dispatched on the document never reach the registered handlers.
// Instead, we capture the callback that Button passes to useKeyboardShortcut
// and invoke it directly — the same pattern used in BaseSelectionListTest.
let enterKeyCallback: ((event?: KeyboardEvent) => void) | undefined;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let capturedShortcutConfig: Record<string, any> | undefined;

jest.mock('@hooks/useKeyboardShortcut', () =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (shortcut: {shortcutKey: string}, callback: (e?: KeyboardEvent) => void, config: Record<string, any> = {}) => {
        if (shortcut.shortcutKey !== 'Enter' || config.isActive === false) {
            return;
        }
        enterKeyCallback = callback;
        capturedShortcutConfig = config;
    },
);
// ──────────────────────────────────────────────────────────────────────────────

jest.mock('@libs/HapticFeedback', () => ({
    press: jest.fn(),
    longPress: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
}));

const LABEL = 'test-button';

/**
 * Reads ButtonContext and exposes each value as a testID'd Text node so that
 * assertions can verify exactly what Button propagates to its children.
 */
function ContextReadout() {
    const {variant, size, isLoading, isHovered} = useButtonContext();
    return (
        <View>
            <Text testID="ctx-variant">{variant ?? 'none'}</Text>
            <Text testID="ctx-size">{size}</Text>
            <Text testID="ctx-isLoading">{String(isLoading)}</Text>
            <Text testID="ctx-isHovered">{String(isHovered)}</Text>
        </View>
    );
}

describe('ButtonComposed — Button', () => {
    const onPress = jest.fn();
    const onLongPress = jest.fn();

    /** Renders the component with a consistent accessibilityLabel for easy querying. */
    const renderButton = (props: Omit<Partial<ButtonProps>, 'children'> = {}, children: React.ReactNode = <ContextReadout />) =>
        render(
            <Button
                accessibilityLabel={LABEL}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            >
                {children}
            </Button>,
        );

    /**
     * Same as renderButton but wrapped in NavigationContainer.
     * Required for tests that render KeyboardShortcutComponent (pressOnEnter=true),
     * because it calls useIsFocused() which needs a navigation context.
     */
    const renderButtonWithNav = (props: Omit<Partial<ButtonProps>, 'children'> = {}, children: React.ReactNode = <ContextReadout />) =>
        render(
            <NavigationContainer>
                <Button
                    accessibilityLabel={LABEL}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                >
                    {children}
                </Button>
            </NavigationContainer>,
        );

    /** Locate the button element by its ARIA role and accessible name. */
    const getButton = () => screen.getByRole(CONST.ROLE.BUTTON, {name: LABEL});

    beforeEach(() => {
        // Reset captured shortcut state so keyboard tests don't bleed into each other.
        enterKeyCallback = undefined;
        capturedShortcutConfig = undefined;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // ── Rendering ──────────────────────────────────────────────────────────────

    describe('rendering', () => {
        it('renders children inside the button', () => {
            // Given a Button with a text child
            renderButton({}, <Text>hello world</Text>);

            // Then the child appears on screen
            expect(screen.getByText('hello world')).toBeOnTheScreen();
        });

        it('renders without children gracefully', () => {
            // Given a Button with no children at all
            renderButton({}, null);

            // Then the button itself is still present
            expect(getButton()).toBeOnTheScreen();
        });

        it('renders an ActivityIndicator while loading', () => {
            // Given a Button in loading state
            const renderResult = renderButton({isLoading: true});

            // Then a spinner is present to signal the in-progress state
            expect(renderResult.UNSAFE_getByType(RNActivityIndicator)).toBeDefined();
        });

        it('applies the default background color', () => {
            // Given a Button with default props
            renderButton();

            // Then the pressable element carries the theme's default button background
            expect(screen.getByLabelText(LABEL)).toHaveStyle({backgroundColor: colors.productDark400});
        });

        it('applies innerStyles to the pressable element', () => {
            // Given a Button with a custom innerStyle
            renderButton({innerStyles: {width: '80%'}});

            // Then the style is merged into the pressable
            expect(screen.getByLabelText(LABEL)).toHaveStyle({width: '80%'});
        });
    });

    // ── ButtonContext ───────────────────────────────────────────────────────────
    //
    // ButtonComposed/Button is the sole owner of ButtonContext. These tests verify
    // that every prop the context exposes reaches children correctly.

    describe('ButtonContext', () => {
        it('provides sensible defaults: size=medium, no variant, not loading, not hovered', () => {
            // Given a Button with no extra props
            renderButton();

            // Then context reflects the expected initial state
            expect(screen.getByTestId('ctx-size')).toHaveTextContent(CONST.DROPDOWN_BUTTON_SIZE.MEDIUM);
            expect(screen.getByTestId('ctx-variant')).toHaveTextContent('none');
            expect(screen.getByTestId('ctx-isLoading')).toHaveTextContent('false');
            expect(screen.getByTestId('ctx-isHovered')).toHaveTextContent('false');
        });

        it.each(['success', 'danger', 'link'] as const)('propagates variant="%s" to children via context', (variant) => {
            renderButton({variant});
            expect(screen.getByTestId('ctx-variant')).toHaveTextContent(variant);
        });

        it.each([CONST.DROPDOWN_BUTTON_SIZE.SMALL, CONST.DROPDOWN_BUTTON_SIZE.LARGE] as const)('propagates size="%s" to children via context', (size) => {
            renderButton({size});
            expect(screen.getByTestId('ctx-size')).toHaveTextContent(size);
        });

        it('propagates isLoading=true to children via context', () => {
            renderButton({isLoading: true});
            expect(screen.getByTestId('ctx-isLoading')).toHaveTextContent('true');
        });

        it('toggles isHovered on hoverIn / hoverOut', () => {
            // Given a rendered Button
            renderButton();

            // When the pointer enters
            fireEvent(getButton(), 'hoverIn');

            // Then children see isHovered=true
            expect(screen.getByTestId('ctx-isHovered')).toHaveTextContent('true');

            // When the pointer leaves
            fireEvent(getButton(), 'hoverOut');

            // Then children see isHovered=false again
            expect(screen.getByTestId('ctx-isHovered')).toHaveTextContent('false');
        });

        it('suppresses isHovered when isDisabled and shouldStayNormalOnDisable are both true', () => {
            // When both flags are set, onHoverIn/Out are not wired up at all.
            renderButton({isDisabled: true, shouldStayNormalOnDisable: true});

            fireEvent(getButton(), 'hoverIn');

            expect(screen.getByTestId('ctx-isHovered')).toHaveTextContent('false');
        });
    });

    // ── Press handling ─────────────────────────────────────────────────────────

    describe('press handling', () => {
        it('calls onPress when pressed', () => {
            // Given a Button with an onPress handler
            renderButton({onPress});

            // When the button is pressed
            fireEvent.press(getButton());

            // Then onPress is called exactly once
            expect(onPress).toHaveBeenCalledTimes(1);
        });

        it('calls onPressIn when the button press begins', () => {
            // Given a Button with an onPressIn handler
            const onPressIn = jest.fn();
            renderButton({onPressIn});

            // When the user starts pressing
            fireEvent(getButton(), 'pressIn');

            // Then onPressIn fires immediately
            expect(onPressIn).toHaveBeenCalledTimes(1);
        });

        it('calls onPressOut when the button press ends', () => {
            // Given a Button with an onPressOut handler
            const onPressOut = jest.fn();
            renderButton({onPressOut});

            // When the user releases
            fireEvent(getButton(), 'pressOut');

            // Then onPressOut fires
            expect(onPressOut).toHaveBeenCalledTimes(1);
        });

        it('blocks onPress when isDisabled is true', () => {
            // Given a disabled Button
            renderButton({isDisabled: true, onPress});

            // When the button is pressed
            fireEvent.press(getButton());

            // Then onPress is not called
            expect(onPress).not.toHaveBeenCalled();
        });

        it('blocks onPress when isLoading is true', () => {
            // Given a loading Button
            renderButton({isLoading: true, onPress});

            // When the button is pressed
            fireEvent.press(getButton());

            // Then onPress is not called
            expect(onPress).not.toHaveBeenCalled();
        });

        it('calls onLongPress when long-pressed', () => {
            // Given a Button with an onLongPress handler
            renderButton({onLongPress});

            // When the button is long-pressed
            fireEvent(getButton(), 'longPress');

            // Then onLongPress is called exactly once
            expect(onLongPress).toHaveBeenCalledTimes(1);
        });

        it('blocks onLongPress when isLongPressDisabled is true', () => {
            // Given a Button with long-press disabled
            renderButton({onLongPress, isLongPressDisabled: true});

            // When the button is long-pressed
            fireEvent(getButton(), 'longPress');

            // Then onLongPress is not called
            expect(onLongPress).not.toHaveBeenCalled();
        });
    });

    // ── Keyboard shortcuts (pressOnEnter) ──────────────────────────────────────
    //
    // Keyboard events don't reach handlers in the test environment because
    // react-native-key-command is mocked to a no-op. Instead, we invoke the
    // captured callback from useKeyboardShortcut directly — this exercises the
    // full path from keyboard event → validateSubmitShortcut → onPress.

    describe('keyboard shortcuts', () => {
        it('triggers onPress when Enter key is pressed and pressOnEnter is true', () => {
            // Given a Button that listens for Enter
            // (isPressOnEnterActive=true keeps the shortcut active without a focused screen)
            renderButtonWithNav({pressOnEnter: true, isPressOnEnterActive: true, onPress});

            // When the Enter key fires
            enterKeyCallback?.(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));

            // Then onPress is called
            expect(onPress).toHaveBeenCalledTimes(1);
        });

        it('does not register an Enter listener when pressOnEnter is false', () => {
            // Given a Button without pressOnEnter (KeyboardShortcutComponent is not rendered)
            renderButton();

            // Then no keyboard shortcut listener was registered at all
            expect(enterKeyCallback).toBeUndefined();
        });

        it('blocks Enter-triggered onPress when isDisabled is true', () => {
            // Given a disabled Button that listens for Enter
            renderButtonWithNav({pressOnEnter: true, isPressOnEnterActive: true, isDisabled: true, onPress});

            // When the Enter key fires
            enterKeyCallback?.(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));

            // Then validateSubmitShortcut blocks the call because isDisabled=true
            expect(onPress).not.toHaveBeenCalled();
        });

        it('blocks Enter-triggered onPress when isLoading is true', () => {
            // Given a loading Button that listens for Enter
            renderButtonWithNav({pressOnEnter: true, isPressOnEnterActive: true, isLoading: true, onPress});

            // When the Enter key fires
            enterKeyCallback?.(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));

            // Then validateSubmitShortcut blocks the call because isLoading=true
            expect(onPress).not.toHaveBeenCalled();
        });

        it('forwards allowBubble as shouldBubble to the keyboard shortcut config', () => {
            // Given a Button that allows the keyboard shortcut to bubble
            renderButtonWithNav({pressOnEnter: true, isPressOnEnterActive: true, allowBubble: true});

            // Then the shortcut config reflects shouldBubble=true
            expect(capturedShortcutConfig?.shouldBubble).toBe(true);
        });

        it('forwards enterKeyEventListenerPriority as priority to the keyboard shortcut config', () => {
            // Given a Button with a custom keyboard shortcut priority
            renderButtonWithNav({pressOnEnter: true, isPressOnEnterActive: true, enterKeyEventListenerPriority: 5});

            // Then the shortcut config reflects the custom priority
            expect(capturedShortcutConfig?.priority).toBe(5);
        });
    });

    // ── Disabled-state styles ──────────────────────────────────────────────────

    describe('disabled-state styles', () => {
        it.each<{variant: ButtonVariant | undefined; label: string}>([
            {variant: undefined, label: 'none'},
            {variant: 'success', label: 'success'},
            {variant: 'danger', label: 'danger'},
        ])('applies opacity:0.5 when isDisabled (variant=$label)', ({variant}) => {
            renderButton({isDisabled: true, variant});
            expect(screen.getByLabelText(LABEL)).toHaveStyle({opacity: 0.5});
        });

        it('keeps the button looking active when shouldStayNormalOnDisable is true', () => {
            // Real-world use-case: a "Save" button that is functionally disabled
            // (e.g., while a form is being validated) but must not look grayed-out to
            // avoid confusing the user. shouldStayNormalOnDisable preserves the normal
            // appearance while the button remains unclickable.
            renderButton({isDisabled: true, shouldStayNormalOnDisable: true});

            // Then there is no opacity reduction — the button looks fully active
            expect(screen.getByLabelText(LABEL)).not.toHaveStyle({opacity: 0.5});
        });

        it('applies a custom disabledStyle when isDisabled is true', () => {
            renderButton({isDisabled: true, disabledStyle: {borderWidth: 2}});
            expect(screen.getByLabelText(LABEL)).toHaveStyle({borderWidth: 2});
        });
    });

    // ── Variant styles ────────────────────────────────────────────────────────
    //
    // Each variant must apply the correct background color from the theme.
    // These are the colors that users see when they look at different button types.

    describe('variant styles', () => {
        it.each([
            {variant: 'success' as const, expectedBg: colors.green400},
            {variant: 'danger' as const, expectedBg: colors.red},
        ])('variant="$variant" applies the correct background color', ({variant, expectedBg}) => {
            renderButton({variant});
            expect(screen.getByLabelText(LABEL)).toHaveStyle({backgroundColor: expectedBg});
        });

        it('variant="link" sets a transparent background', () => {
            // Link buttons must not obscure underlying content.
            renderButton({variant: 'link'});
            expect(screen.getByLabelText(LABEL)).toHaveStyle({backgroundColor: 'transparent'});
        });

        it('no variant uses the default button background', () => {
            // Implicit check that nothing accidentally overrides the base background.
            renderButton();
            expect(screen.getByLabelText(LABEL)).toHaveStyle({backgroundColor: colors.productDark400});
        });
    });

    // ── Size styles ───────────────────────────────────────────────────────────
    //
    // Each size token must produce the correct minHeight and horizontal padding.
    // Wrong values here would break the visual rhythm of forms and toolbars.

    describe('size styles', () => {
        it.each([
            {size: CONST.DROPDOWN_BUTTON_SIZE.SMALL, minHeight: variables.componentSizeSmall, paddingHorizontal: 12},
            {size: CONST.DROPDOWN_BUTTON_SIZE.MEDIUM, minHeight: variables.componentSizeNormal, paddingHorizontal: 16},
            {size: CONST.DROPDOWN_BUTTON_SIZE.LARGE, minHeight: variables.componentSizeLarge, paddingHorizontal: 20},
            {size: CONST.DROPDOWN_BUTTON_SIZE.EXTRA_SMALL, minHeight: variables.componentSizeXSmall, paddingHorizontal: 8},
        ])('size="$size" applies minHeight=$minHeight and paddingHorizontal=$paddingHorizontal', ({size, minHeight, paddingHorizontal}) => {
            renderButton({size});
            expect(screen.getByLabelText(LABEL)).toHaveStyle({minHeight, paddingHorizontal});
        });
    });

    // ── shouldRemoveBorderRadius ──────────────────────────────────────────────
    //
    // When Button is placed in a ButtonGroup, one or both ends must be squared
    // off so adjacent buttons sit flush. This verifies that the correct corners
    // are zeroed out for each option.

    describe('shouldRemoveBorderRadius', () => {
        it.each([
            {
                label: 'right',
                shouldRemoveBorderRadius: 'right' as const,
                expectedStyle: {borderTopRightRadius: 0, borderBottomRightRadius: 0},
            },
            {
                label: 'left',
                shouldRemoveBorderRadius: 'left' as const,
                expectedStyle: {borderTopLeftRadius: 0, borderBottomLeftRadius: 0},
            },
            {
                label: 'all',
                shouldRemoveBorderRadius: 'all' as const,
                expectedStyle: {borderTopRightRadius: 0, borderBottomRightRadius: 0, borderTopLeftRadius: 0, borderBottomLeftRadius: 0},
            },
        ])('shouldRemoveBorderRadius="$label" zeros out the correct corners', ({shouldRemoveBorderRadius, expectedStyle}) => {
            renderButton({shouldRemoveBorderRadius});
            expect(screen.getByLabelText(LABEL)).toHaveStyle(expectedStyle);
        });
    });

    // ── Hover styles ──────────────────────────────────────────────────────────
    //
    // The button must change appearance while the pointer is over it and return
    // to normal when the pointer leaves.

    describe('hover styles', () => {
        it('applies the default hover background when shouldUseDefaultHover is true', () => {
            // Given a default Button (shouldUseDefaultHover defaults to true)
            renderButton();

            // When the pointer enters
            fireEvent(getButton(), 'hoverIn');

            // Then the button shows the hover background
            expect(screen.getByLabelText(LABEL)).toHaveStyle({backgroundColor: colors.productDark500});
        });

        it('does not apply the default hover background when shouldUseDefaultHover is false', () => {
            // Given a Button that opts out of default hover styling
            renderButton({shouldUseDefaultHover: false});

            // When the pointer enters
            fireEvent(getButton(), 'hoverIn');

            // Then the background stays unchanged
            expect(screen.getByLabelText(LABEL)).toHaveStyle({backgroundColor: colors.productDark400});
        });

        it('applies custom hoverStyles when hovered', () => {
            // Given a Button with a custom hover border
            renderButton({hoverStyles: {borderWidth: 3}});

            // When the pointer enters
            fireEvent(getButton(), 'hoverIn');

            // Then the custom style is applied
            expect(screen.getByLabelText(LABEL)).toHaveStyle({borderWidth: 3});
        });

        it.each([
            {variant: 'success' as const, expectedHoverBg: colors.greenHover},
            {variant: 'danger' as const, expectedHoverBg: colors.redHover},
        ])('variant="$variant" applies its dedicated hover background when hovered', ({variant, expectedHoverBg}) => {
            // Variant-specific hover styles override the default hover background so that
            // success stays green and danger stays red even when highlighted.
            renderButton({variant});
            fireEvent(getButton(), 'hoverIn');
            expect(screen.getByLabelText(LABEL)).toHaveStyle({backgroundColor: expectedHoverBg});
        });
    });

    // ── Accessibility ──────────────────────────────────────────────────────────

    describe('accessibility', () => {
        it('exposes the button via accessibilityLabel', () => {
            // Given a Button is rendered
            renderButton();

            // Then it is reachable via its label (used by screen readers and getByLabelText)
            expect(screen.getByLabelText(LABEL)).toBeOnTheScreen();
        });

        it('forwards accessibilityState to the underlying pressable', () => {
            // Given a Button with a custom accessibilityState
            renderButton({accessibilityState: {selected: true}});

            // Then the state is forwarded verbatim to the pressable element
            expect(getButton().props.accessibilityState).toMatchObject({selected: true});
        });

        it('forwards testID to the underlying pressable', () => {
            // Given a Button with a testID
            renderButton({testID: 'my-test-id'});

            // Then the element is findable by that testID
            expect(screen.getByTestId('my-test-id')).toBeOnTheScreen();
        });

        it('forwards id to the underlying pressable', () => {
            // Given a Button with an id
            renderButton({id: 'my-button-id'});

            // Then the id appears on the accessible element
            expect(getButton().props.id).toBe('my-button-id');
        });

        it('maintains button role when isNested is true', () => {
            // isNested signals a button-in-button context (invalid HTML), but the role
            // stays as BUTTON so the element remains accessible to screen readers.
            renderButton({isNested: true});
            expect(getButton()).toBeOnTheScreen();
        });

        it('forwards sentryLabel to the underlying pressable', () => {
            // Given a Button with a Sentry label (used for performance tracking)
            // Note: in the test environment NativeGenericPressable is loaded (not WebGenericPressable),
            // so sentryLabel flows through {...rest} directly to the native Pressable as a prop,
            // rather than being merged into dataSet (which is the web-only path).
            renderButton({sentryLabel: 'submit-button'});

            expect(getButton().props.sentryLabel).toBe('submit-button');
        });

        it('forwards ref to the underlying pressable', () => {
            // Given a ref attached to the Button
            const ref = React.createRef<View>();
            renderButton({ref});

            // Then the ref is populated after mount (non-null means the native element
            // is reachable for imperative calls such as .measure() or .focus())
            expect(ref.current).not.toBeNull();
        });
    });

    // ── Event handlers ────────────────────────────────────────────────────────

    describe('event handlers', () => {
        it('calls onMouseDown when a mousedown event fires', () => {
            // Given a Button with an onMouseDown handler (e.g. to prevent focus steal)
            const onMouseDown = jest.fn();
            renderButton({onMouseDown});

            // When a mousedown event fires on the button
            fireEvent(getButton(), 'mouseDown');

            // Then onMouseDown is called
            expect(onMouseDown).toHaveBeenCalledTimes(1);
        });

        it('calls onLayout when the component measures itself', () => {
            // Given a Button with an onLayout handler (e.g. to position a dropdown)
            const onLayout = jest.fn();
            renderButton({onLayout});

            // When a layout event fires
            fireEvent(getButton(), 'layout', {nativeEvent: {layout: {width: 200, height: 48, x: 0, y: 0}}});

            // Then onLayout is called
            expect(onLayout).toHaveBeenCalledTimes(1);
        });
    });

    // ── Haptic feedback ───────────────────────────────────────────────────────

    describe('haptic feedback', () => {
        it('triggers HapticFeedback.press on press when shouldEnableHapticFeedback is true', () => {
            // Given a Button with haptic feedback enabled (e.g. a primary CTA on mobile)
            renderButton({shouldEnableHapticFeedback: true});

            // When the button is pressed
            fireEvent.press(getButton());

            // Then the haptic press pulse fires
            expect(HapticFeedback.press).toHaveBeenCalledTimes(1);
        });

        it('does not trigger haptic feedback on press by default', () => {
            // Given a Button without haptic feedback
            renderButton();

            // When pressed
            fireEvent.press(getButton());

            // Then no haptic feedback fires
            expect(HapticFeedback.press).not.toHaveBeenCalled();
        });

        it('triggers HapticFeedback.longPress on long press when shouldEnableHapticFeedback is true', () => {
            // Given a Button with haptic feedback enabled
            renderButton({shouldEnableHapticFeedback: true});

            // When the button is long-pressed
            fireEvent(getButton(), 'longPress');

            // BaseGenericPressable fires HapticFeedback.longPress once by default
            // (shouldUseHapticsOnLongPress=true). Button.tsx adds a second call when
            // shouldEnableHapticFeedback=true, so the total is 2.
            expect(HapticFeedback.longPress).toHaveBeenCalledTimes(2);
        });
    });

    // ── Layout and composition ────────────────────────────────────────────────

    describe('layout and composition', () => {
        it('applies custom style to the outer wrapper', () => {
            // Given a Button with a custom outer style (e.g. margin for spacing)
            const renderResult = renderButton({style: {margin: 10}});

            // `style` maps to PressableWithFeedback's wrapperStyle on the outer OpacityView.
            // We find it by scanning for any host View in the tree that carries the margin.
            const wrapperView = renderResult.UNSAFE_getAllByType(View).find((v) => (StyleSheet.flatten(v.props.style ?? []) as {margin?: number})?.margin === 10);
            expect(wrapperView).toBeDefined();
        });

        it('applies contentContainerStyle to the content wrapper', () => {
            // Given a Button with a custom contentContainerStyle
            const renderResult = renderButton({contentContainerStyle: {paddingTop: 8}});

            // contentContainerStyle is applied to the flexRow View wrapping all children.
            // We find it by scanning host Views for the custom padding.
            const contentWrapper = renderResult.UNSAFE_getAllByType(View).find((v) => (StyleSheet.flatten(v.props.style ?? []) as {paddingTop?: number})?.paddingTop === 8);
            expect(contentWrapper).toBeDefined();
        });

        it('renders a full-size absolute overlay when shouldBlendOpacity is true', () => {
            // Button.tsx renders <View style={[StyleSheet.absoluteFill, buttonBlendForegroundStyle]} />
            // when shouldBlendOpacity=true — an overlay that lets content beneath show through.
            const renderResult = renderButton({shouldBlendOpacity: true});

            const overlayView = renderResult.UNSAFE_getAllByType(View).find((v) => {
                const flat = StyleSheet.flatten(v.props.style ?? []) as {position?: string};
                return flat?.position === 'absolute';
            });

            expect(overlayView).toBeDefined();

            // The overlay must cover the full button — verify absoluteFill dimensions
            const overlayStyle = StyleSheet.flatten(overlayView?.props.style ?? []) as {
                position?: string;
                top?: number;
                left?: number;
                right?: number;
                bottom?: number;
            };
            expect(overlayStyle).toMatchObject({position: 'absolute', top: 0, left: 0, right: 0, bottom: 0});
        });
    });
});
