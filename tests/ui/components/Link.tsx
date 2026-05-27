import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Link from '@src/components/ButtonComposed/composed/Link';
import ButtonDoubleLineText from '@src/components/ButtonComposed/primitives/ButtonDoubleLineText';
import ButtonIcon from '@src/components/ButtonComposed/primitives/ButtonIcon';
import ButtonKeyboardShortcut from '@src/components/ButtonComposed/primitives/ButtonKeyboardShortcut';
import CONST from '@src/CONST';
import colors from '@src/styles/theme/colors';
import variables from '@src/styles/variables';

const LABEL = 'test-link';
const TEXT = 'Open docs';

const renderLink = (innerStyles?: React.ComponentProps<typeof Link>['innerStyles']) =>
    render(
        <Link
            accessibilityLabel={LABEL}
            innerStyles={innerStyles}
        >
            <Link.Text>{TEXT}</Link.Text>
        </Link>,
    );

const getButton = () => screen.getByRole(CONST.ROLE.BUTTON, {name: LABEL});

describe('ButtonComposed — Link', () => {
    describe('transparent background invariant', () => {
        it('renders with a transparent background by default', () => {
            // Link buttons must not obscure underlying content.
            renderLink();
            expect(getButton()).toHaveStyle({backgroundColor: 'transparent'});
        });

        it('keeps the transparent background even when innerStyles tries to override it', () => {
            // bgTransparent is appended AFTER innerStyles inside Link, so callers cannot
            // accidentally re-introduce a background and break the link visual.
            renderLink({backgroundColor: 'red'});
            expect(getButton()).toHaveStyle({backgroundColor: 'transparent'});
        });
    });

    describe('shouldUseDefaultHover invariant', () => {
        it('does not apply the default button hover background when hovered', () => {
            // Link force-disables shouldUseDefaultHover. On hover, the underlying
            // Button must NOT swap to the gray hover bg — the link stays transparent.
            renderLink();
            fireEvent(getButton(), 'hoverIn');
            expect(getButton()).toHaveStyle({backgroundColor: 'transparent'});
        });
    });

    describe('Link.Text styling', () => {
        it('renders text with link color, normal font weight, and label font size in the default state', () => {
            renderLink();
            const text = screen.getByText(TEXT);
            // theme.link is blue300 in the default dark theme.
            expect(text).toHaveStyle({color: colors.blue300});
            expect(text).toHaveStyle({fontWeight: '400'});
            expect(text).toHaveStyle({fontSize: variables.fontSizeLabel});
        });

        it('swaps the text color to linkHover when the button is hovered', () => {
            // This guards against regressions in the ButtonText style-array ordering
            // (hoverStyle must be applied AFTER style so linkHover overrides the default link color).
            renderLink();
            fireEvent(getButton(), 'hoverIn');
            const text = screen.getByText(TEXT);
            // theme.linkHover is blue100 in the default dark theme.
            expect(text).toHaveStyle({color: colors.blue100});
        });

        it('reverts to the link color after the pointer leaves', () => {
            renderLink();
            fireEvent(getButton(), 'hoverIn');
            fireEvent(getButton(), 'hoverOut');
            expect(screen.getByText(TEXT)).toHaveStyle({color: colors.blue300});
        });
    });

    describe('composable primitives', () => {
        // Smoke check that Object.assign-ed primitives are actually exposed and
        // point at the underlying ButtonComposed primitives (no link-specific override
        // beyond Text). If a refactor accidentally drops one of these, this fails fast.
        it('exposes Icon, DoubleLineText, and KeyboardShortcut from the ButtonComposed primitives', () => {
            expect(Link.Icon).toBe(ButtonIcon);
            expect(Link.DoubleLineText).toBe(ButtonDoubleLineText);
            expect(Link.KeyboardShortcut).toBe(ButtonKeyboardShortcut);
        });
    });
});
