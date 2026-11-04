// Regression coverage for the error-page heading and its existing recovery actions.
import {fireEvent, render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesContextProvider';

import useIsAuthenticated from '@hooks/useIsAuthenticated';
import usePageRefresh from '@hooks/usePageRefresh';

import GenericErrorPage from '@pages/ErrorPage/GenericErrorPage';

import {signOutAndRedirectToSignIn} from '@userActions/Session';

import CONST from '@src/CONST';
import en from '@src/languages/en';

import React from 'react';

jest.mock('@hooks/useIsAuthenticated', () => jest.fn());
jest.mock('@hooks/usePageRefresh', () => jest.fn());
jest.mock('@userActions/Session', () => ({signOutAndRedirectToSignIn: jest.fn()}));

// Artwork loads independently of the heading and recovery controls under test.
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: () => ({})}));

const refreshPage = jest.fn();

async function renderErrorPage(error?: Error) {
    render(
        <ThemeProvider theme={CONST.THEME.LIGHT}>
            <ThemeStylesProvider>
                <LocaleContextProvider>
                    <GenericErrorPage error={error} />
                </LocaleContextProvider>
            </ThemeStylesProvider>
        </ThemeProvider>,
    );
    await screen.findByText(en.genericErrorPage.title);
}

beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useIsAuthenticated).mockReturnValue(false);
    jest.mocked(usePageRefresh).mockReturnValue(refreshPage);
});

it.each([false, true])('exposes the error title as a heading (authenticated: %s)', async (isAuthenticated) => {
    // Given either a signed-in or signed-out user on the error page
    jest.mocked(useIsAuthenticated).mockReturnValue(isAuthenticated);

    // When the real page and Text component render
    await renderErrorPage();

    // Then heading navigation can find the unchanged title without making the body a heading
    expect(screen.getAllByRole('header')).toHaveLength(1);
    expect(screen.getByRole('header', {name: en.genericErrorPage.title})).toBeTruthy();
    expect(screen.getByText(CONST.EMAIL.CONCIERGE)).toBeTruthy();
    expect(screen.queryByRole('button', {name: en.initialSettingsPage.signOut}) !== null).toBe(isAuthenticated);
});

it.each([undefined, new Error('Render failed'), Object.assign(new Error('Import failed'), {name: 'ChunkLoadError'})])('preserves Refresh behavior for %s', async (error) => {
    // Given an error page with an ordinary, missing, or chunk-load error
    await renderErrorPage(error);

    // When the user chooses Refresh
    fireEvent.press(screen.getByRole('button', {name: en.genericErrorPage.refresh}));

    // Then only chunk-load failures request cache recovery
    expect(refreshPage).toHaveBeenCalledTimes(1);
    expect(refreshPage).toHaveBeenCalledWith(error?.name === 'ChunkLoadError');
    expect(signOutAndRedirectToSignIn).not.toHaveBeenCalled();
});

it('preserves authenticated sign-out and refresh', async () => {
    // Given an authenticated user on the error page
    jest.mocked(useIsAuthenticated).mockReturnValue(true);
    await renderErrorPage();

    // When the user chooses Sign out
    fireEvent.press(screen.getByRole('button', {name: en.initialSettingsPage.signOut}));

    // Then sign-out still runs and refresh does not request chunk-cache recovery
    expect(signOutAndRedirectToSignIn).toHaveBeenCalledTimes(1);
    expect(refreshPage).toHaveBeenCalledTimes(1);
    expect(refreshPage).toHaveBeenCalledWith();
});
