import {act, render} from '@testing-library/react-native';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import getPathFromState from '@libs/Navigation/helpers/getPathFromState';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {InitialState} from '@react-navigation/native';

import {findFocusedRoute} from '@react-navigation/native';
import React from 'react';

import TestNavigationContainer from '../utils/TestNavigationContainer';

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@libs/getIsNarrowLayout', () => jest.fn());
jest.mock('@pages/inbox/sidebar/NavigationTabBarAvatar');

const CHAT_REPORT_ID = '100';

const chatState = {
    index: 0,
    routes: [
        {
            name: NAVIGATORS.TAB_NAVIGATOR,
            state: {
                index: 1,
                routes: [
                    {name: SCREENS.HOME},
                    {
                        name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                        state: {index: 1, routes: [{name: SCREENS.INBOX}, {name: SCREENS.REPORT, params: {reportID: CHAT_REPORT_ID}}]},
                    },
                    {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR},
                    {name: SCREENS.INSIGHTS},
                    {name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR},
                    {name: NAVIGATORS.WORKSPACE_NAVIGATOR},
                ],
            },
        },
    ],
};

/**
 * The Talk to a human page pops itself before opening a support ticket, and the ticket stores the route it was
 * opened from as its Back target. These pin that the pop leaves a real page behind, so the ticket never records
 * the loader itself.
 */
describe.each([
    ['wide layout', false],
    ['narrow layout', true],
])('Talk to a human route on a %s', (_name, isNarrow) => {
    beforeEach(() => {
        jest.mocked(getIsNarrowLayout).mockReturnValue(isNarrow);
        jest.mocked(useResponsiveLayout).mockReturnValue({
            ...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE,
            shouldUseNarrowLayout: isNarrow,
            isSmallScreenWidth: isNarrow,
        });
    });

    it('returns to the chat the link was pressed in', () => {
        // Given a chat open in the app
        render(<TestNavigationContainer initialState={chatState} />);

        // When the link is pressed and the page pops itself
        act(() => {
            Navigation.navigate(ROUTES.TALK_TO_HUMAN);
        });
        expect(Navigation.getActiveRoute()).toBe(`/${ROUTES.TALK_TO_HUMAN}`);
        act(() => {
            Navigation.goBack();
        });

        // Then the chat is the active route, so the ticket records it as its Back target
        expect(Navigation.getActiveRoute()).toBe(`/r/${CHAT_REPORT_ID}`);
    });

    it('still pops when a wide to narrow resize left a pending pop to the sidebar', () => {
        // Given a chat open in the app and the link pressed
        render(<TestNavigationContainer initialState={chatState} />);
        act(() => {
            Navigation.navigate(ROUTES.TALK_TO_HUMAN);
        });

        // When the resize flag is pending and the page clears it before leaving, as TalkToHumanPage does
        act(() => {
            Navigation.setShouldPopToSidebar(true);
        });
        act(() => {
            Navigation.setShouldPopToSidebar(false);
            Navigation.goBack();
        });

        // Then the page is gone, so the ticket does not record this route as its Back target
        expect(Navigation.getActiveRoute()).toBe(`/r/${CHAT_REPORT_ID}`);
    });

    it('leaves a page behind when the link is opened directly', () => {
        // Given the route opened from a cold link, which has no page of its own to return to
        render(<TestNavigationContainer initialState={getAdaptedStateFromPath(ROUTES.TALK_TO_HUMAN) as InitialState} />);
        expect(Navigation.getActiveRoute()).toBe(`/${ROUTES.TALK_TO_HUMAN}`);

        // When the page pops itself
        act(() => {
            Navigation.goBack();
        });

        // Then it lands on a real page instead of stranding the customer on the loader
        expect(Navigation.getActiveRoute()).not.toBe(`/${ROUTES.TALK_TO_HUMAN}`);
        expect(navigationRef.current?.getRootState().routes.at(-1)?.name).toBe(NAVIGATORS.TAB_NAVIGATOR);
    });
});

describe('Talk to a human deep link', () => {
    it('resolves the link to the Talk to a human page', () => {
        // Given the link that Concierge replies point to
        // When it is opened as a URL
        const state = getAdaptedStateFromPath(`/${ROUTES.TALK_TO_HUMAN}`);

        // Then the focused screen is the Talk to a human page, and the URL survives a round trip
        expect(findFocusedRoute(state)?.name).toBe(SCREENS.TALK_TO_HUMAN);
        expect(getPathFromState(state)).toBe(`/${ROUTES.TALK_TO_HUMAN}`);
    });
});
