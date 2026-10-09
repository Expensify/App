import {render} from '@testing-library/react-native';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {NavigationState} from '@react-navigation/native';

import React from 'react';

import TestNavigationContainer from '../utils/TestNavigationContainer';

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@libs/getIsNarrowLayout', () => jest.fn());

jest.mock('@pages/inbox/sidebar/NavigationTabBarAvatar');

const mockedGetIsNarrowLayout = jest.mocked(getIsNarrowLayout);
const mockedUseResponsiveLayout = jest.mocked(useResponsiveLayout);

/** Builds a root stack state with the given routes, focused on the last one */
function buildRootState(routeNames: string[]): NavigationState {
    return {
        key: 'root',
        index: routeNames.length - 1,
        routeNames,
        routes: routeNames.map((name) => ({key: `${name}-key`, name})),
        type: 'stack',
        stale: false,
    };
}

describe('Navigation', () => {
    beforeEach(() => {
        mockedGetIsNarrowLayout.mockReturnValue(false);
        mockedUseResponsiveLayout.mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, shouldUseNarrowLayout: false});
    });

    describe('isValidateLoginFlow', () => {
        it('should return true when the current focused route is the validate login screen', () => {
            // Given the navigation state with the validate login screen
            render(
                <TestNavigationContainer
                    initialState={{
                        index: 0,
                        routes: [
                            {
                                name: 'ValidateLogin',
                            },
                        ],
                    }}
                />,
            );

            expect(Navigation.isValidateLoginFlow(navigationRef.getRootState())).toBe(true);
        });
    });

    describe('shouldHideOnboardingNavigator', () => {
        it('should hide the onboarding navigator on the validate login screen before onboarding has started', () => {
            // Given a fresh magic link sign-in, where the validate login screen is focused and onboarding isn't in the root stack yet
            const state = buildRootState([NAVIGATORS.TAB_NAVIGATOR, SCREENS.VALIDATE_LOGIN]);

            // When checking whether the onboarding navigator should be registered
            // Then it is hidden so onboarding doesn't open over the validate login screen
            expect(Navigation.shouldHideOnboardingNavigator(state)).toBe(true);
        });

        it('should keep the onboarding navigator when the validate login screen is pushed over onboarding', () => {
            // Given a user in the middle of onboarding who opens a magic link, pushing the validate login screen over the onboarding navigator
            const state = buildRootState([NAVIGATORS.TAB_NAVIGATOR, NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR, SCREENS.VALIDATE_LOGIN]);

            // When checking whether the onboarding navigator should be registered
            // Then it stays registered, because unregistering it would drop the onboarding route and the user's progress
            expect(Navigation.shouldHideOnboardingNavigator(state)).toBe(false);
        });

        it('should not hide the onboarding navigator once the user leaves the validate login screen', () => {
            // Given the validate login screen was popped and the user is back on the tab navigator
            const state = buildRootState([NAVIGATORS.TAB_NAVIGATOR]);

            // When checking whether the onboarding navigator should be registered
            // Then it is registered so startOnboardingFlow can reset into it
            expect(Navigation.shouldHideOnboardingNavigator(state)).toBe(false);
        });
    });
});
