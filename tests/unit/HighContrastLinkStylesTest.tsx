import {render, screen} from '@testing-library/react-native';

import SubtitleWithBelowLink from '@components/BlockingViews/SubtitleWithBelowLink';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import PatriotActLink from '@components/PatriotActLink';
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
 * These tests take real elements from the app UI that happen to contain a link and render them through
 * the actual theme providers, then read the underline off the link that ends up on screen - the same
 * path a user's link goes through:
 *
 * - `PatriotActLink` - a help link shown in KYC/additional-details flows (renders a URL link).
 * - `SubtitleWithBelowLink` - a subtitle used by blocking views that auto-links the email in its text
 *   (renders an email link).
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

function renderInApp(theme: ThemePreferenceWithoutSystem, ui: React.ReactElement) {
    // ThemeProvider must be the outermost provider so the rest read the selected theme. We render it
    // directly (rather than as an inline component passed to ComposeProviders) to avoid a React Compiler
    // memoization divergence between the Babel and OXC compilers.
    return render(
        <ThemeProvider theme={theme}>
            <ComposeProviders components={[ThemeStylesProvider, OnyxListItemProvider, LocaleContextProvider]}>{ui}</ComposeProviders>
        </ThemeProvider>,
    );
}

describe('High contrast link underline', () => {
    describe('PatriotActLink (a URL link in the app UI)', () => {
        it.each(HIGH_CONTRAST_THEMES)('is underlined in the $name theme', async ({theme}) => {
            renderInApp(theme, <PatriotActLink />);
            await waitForBatchedUpdates();
            expect(screen.getByRole(CONST.ROLE.LINK)).toHaveStyle({textDecorationLine: 'underline'});
        });

        it.each(NORMAL_THEMES)('is not underlined in the $name theme', async ({theme}) => {
            renderInApp(theme, <PatriotActLink />);
            await waitForBatchedUpdates();
            expect(screen.getByRole(CONST.ROLE.LINK)).toHaveStyle({textDecorationLine: 'none'});
        });
    });

    describe('SubtitleWithBelowLink (an email link in the app UI)', () => {
        it.each(HIGH_CONTRAST_THEMES)('is underlined in the $name theme', async ({theme}) => {
            renderInApp(theme, <SubtitleWithBelowLink subtitle="Reach us at concierge@expensify.com anytime" />);
            await waitForBatchedUpdates();
            expect(screen.getByRole(CONST.ROLE.LINK)).toHaveStyle({textDecorationLine: 'underline'});
        });

        it.each(NORMAL_THEMES)('is not underlined in the $name theme', async ({theme}) => {
            renderInApp(theme, <SubtitleWithBelowLink subtitle="Reach us at concierge@expensify.com anytime" />);
            await waitForBatchedUpdates();
            expect(screen.getByRole(CONST.ROLE.LINK)).toHaveStyle({textDecorationLine: 'none'});
        });
    });
});
