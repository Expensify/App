import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {ActivityIndicator as RNActivityIndicator, Text, View} from 'react-native';
import colors from '@styles/theme/colors';
import Button from '@src/components/ButtonComposed/Button';
import {useButtonContext} from '@src/components/ButtonComposed/context';
import type {ButtonVariant} from '@src/components/ButtonComposed/context';
import type {ButtonProps} from '@src/components/ButtonComposed/types';
import CONST from '@src/CONST';

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

    /** Locate the button element by its ARIA role and accessible name. */
    const getButton = () => screen.getByRole(CONST.ROLE.BUTTON, {name: LABEL});

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

        it('applies the default background colour', () => {
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

        it.each(['success', 'danger'] as const)('propagates variant="%s" to children via context', (variant) => {
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

        it('blocks onPress even when shouldStayNormalOnDisable is true', () => {
            // shouldStayNormalOnDisable only skips the disabled visual styles —
            // the button remains functionally disabled.
            renderButton({isDisabled: true, shouldStayNormalOnDisable: true, onPress});

            fireEvent.press(getButton());

            expect(onPress).not.toHaveBeenCalled();
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

        it('does not apply opacity:0.5 when shouldStayNormalOnDisable is true', () => {
            renderButton({isDisabled: true, shouldStayNormalOnDisable: true});
            expect(screen.getByLabelText(LABEL)).not.toHaveStyle({opacity: 0.5});
        });

        it('applies a custom disabledStyle when isDisabled is true', () => {
            renderButton({isDisabled: true, disabledStyle: {borderWidth: 2}});
            expect(screen.getByLabelText(LABEL)).toHaveStyle({borderWidth: 2});
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
    });
});
