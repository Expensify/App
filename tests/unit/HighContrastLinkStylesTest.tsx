import {render, screen} from '@testing-library/react-native';

import AutoEmailLink from '@components/AutoEmailLink';
import TextLink from '@components/TextLink';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesContextProvider';

import type {ThemePreferenceWithoutSystem} from '@styles/theme/types';

import CONST from '@src/CONST';

import React from 'react';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

/**
 * Regression tests for https://github.com/Expensify/App/issues/76919 (PR #96618).
 *
 * Links must be distinguishable by more than color in high-contrast themes (WCAG 1.4.1 - Use of Color),
 * so they are underlined when a high-contrast theme is active and left without an underline otherwise.
 *
 * Rather than asserting on the raw `link`/`emailLink` style objects, these tests render real link
 * components from the app (`TextLink` and `AutoEmailLink`) inside the actual theme providers and read
 * the underline off the element that ends up on screen - the same path a user's link goes through.
 */
type NamedTheme = {name: string; theme: ThemePreferenceWithoutSystem};

const HIGH_CONTRAST_THEMES: NamedTheme[] = [
    {name: 'light-contrast', theme: CONST.THEME.LIGHT_CONTRAST},
    {name: 'dark-contrast', theme: CONST.THEME.DARK_CONTRAST},
];

const NORMAL_THEMES: NamedTheme[] = [
    {name: 'light', theme: CONST.THEME.LIGHT},
    {name: 'dark', theme: CONST.THEME.DARK},
];

function renderWithTheme(theme: ThemePreferenceWithoutSystem, ui: React.ReactElement) {
    return render(
        <ThemeProvider theme={theme}>
            <ThemeStylesProvider>{ui}</ThemeStylesProvider>
        </ThemeProvider>,
    );
}

describe('High contrast link underline', () => {
    describe('TextLink (a real URL link)', () => {
        it.each(HIGH_CONTRAST_THEMES)('is underlined in the $name theme', async ({theme}) => {
            renderWithTheme(theme, <TextLink href="https://new.expensify.com">Open Expensify</TextLink>);
            await waitForBatchedUpdates();
            expect(screen.getByRole(CONST.ROLE.LINK)).toHaveStyle({textDecorationLine: 'underline'});
        });

        it.each(NORMAL_THEMES)('is not underlined in the $name theme', async ({theme}) => {
            renderWithTheme(theme, <TextLink href="https://new.expensify.com">Open Expensify</TextLink>);
            await waitForBatchedUpdates();
            expect(screen.getByRole(CONST.ROLE.LINK)).toHaveStyle({textDecorationLine: 'none'});
        });
    });

    describe('AutoEmailLink (a real email link)', () => {
        it.each(HIGH_CONTRAST_THEMES)('is underlined in the $name theme', async ({theme}) => {
            renderWithTheme(theme, <AutoEmailLink text="Reach us at concierge@expensify.com anytime" />);
            await waitForBatchedUpdates();
            expect(screen.getByRole(CONST.ROLE.LINK)).toHaveStyle({textDecorationLine: 'underline'});
        });

        it.each(NORMAL_THEMES)('is not underlined in the $name theme', async ({theme}) => {
            renderWithTheme(theme, <AutoEmailLink text="Reach us at concierge@expensify.com anytime" />);
            await waitForBatchedUpdates();
            expect(screen.getByRole(CONST.ROLE.LINK)).toHaveStyle({textDecorationLine: 'none'});
        });
    });
});
