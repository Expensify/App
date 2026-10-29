import {render} from '@testing-library/react-native';

import getNavigationBaseTheme from '@libs/Navigation/getNavigationBaseTheme';
import NavigationRoot from '@libs/Navigation/NavigationRoot';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import type * as ReactNavigation from '@react-navigation/native';

import {DarkTheme, DefaultTheme} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// The `mock` prefix lets the hoisted jest.mock factory capture the theme NavigationRoot passes down.
let mockCapturedTheme: ReactNavigation.Theme | undefined;

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        NavigationContainer: ({theme}: {theme?: ReactNavigation.Theme}) => {
            mockCapturedTheme = theme;
            return null;
        },
    };
});
jest.mock('@libs/Navigation/AppNavigator', () => () => null);
jest.mock('@libs/NavigationFocusReturn', () => ({setupNavigationFocusReturn: jest.fn(), teardownNavigationFocusReturn: jest.fn()}));
jest.mock('@src/libs/telemetry/useStartSpansOnRender', () => jest.fn());
jest.mock('@hooks/useThemePreference', () => () => 'light');
jest.mock('@hooks/useTheme', () => () => ({appBG: '#000000', colorScheme: 'dark'}));
jest.mock('@hooks/useResponsiveLayout', () => () => ({shouldUseNarrowLayout: true}));

describe('getNavigationBaseTheme', () => {
    it('returns the dark base theme for the dark color scheme', () => {
        // Given the app theme resolved to the dark color scheme
        // When the navigation base theme is picked for it
        // Then it is the dark one, so native navigation UI renders dark
        expect(getNavigationBaseTheme(CONST.COLOR_SCHEME.DARK)).toBe(DarkTheme);
    });

    it('returns the default base theme for the light color scheme', () => {
        // Given the app theme resolved to the light color scheme
        // When the navigation base theme is picked for it
        // Then it is the default light one
        expect(getNavigationBaseTheme(CONST.COLOR_SCHEME.LIGHT)).toBe(DefaultTheme);
    });
});

describe('NavigationRoot theme', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockCapturedTheme = undefined;
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('follows the app theme color scheme while the theme preference has already changed', () => {
        // Given the theme preference already switched to light, but the debounced app theme is still dark
        // When the navigation root renders
        render(
            <NavigationRoot
                authenticated
                lastVisitedPath={ROUTES.HOME}
                initialUrl={null}
                onReady={() => {}}
            />,
        );

        // Then the navigation theme stays dark, because the native tab bar reads its color scheme from it and must switch together with the app
        expect(mockCapturedTheme?.dark).toBe(true);
    });
});
