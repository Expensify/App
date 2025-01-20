import {act, render} from '@testing-library/react-native';
import React from 'react';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import navigationRef from '@libs/Navigation/navigationRef';
import switchPolicyAfterInteractions from '@pages/WorkspaceSwitcherPage/switchPolicyAfterInteractions';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import TestNavigationContainer from '../utils/TestNavigationContainer';

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@libs/getIsNarrowLayout', () => jest.fn());

jest.mock('@pages/home/sidebar/BottomTabAvatar');
jest.mock('@src/components/Navigation/TopLevelBottomTabBar');

const mockedGetIsNarrowLayout = getIsNarrowLayout as jest.MockedFunction<typeof getIsNarrowLayout>;
const mockedUseResponsiveLayout = useResponsiveLayout as jest.MockedFunction<typeof useResponsiveLayout>;

describe('Switch policy ID', () => {
    beforeEach(() => {
        mockedGetIsNarrowLayout.mockReturnValue(true);
        mockedUseResponsiveLayout.mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, shouldUseNarrowLayout: true});
    });

    describe('from the global to the specific workspace', () => {
        it('from the Inbox tab', () => {
            // Given the initialized navigation on the narrow layout with the reports split navigator without the active workspace
            render(
                <TestNavigationContainer
                    initialState={{
                        index: 0,
                        routes: [
                            {
                                name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                                state: {
                                    index: 1,
                                    routes: [
                                        {
                                            name: SCREENS.HOME,
                                        },
                                        {
                                            name: SCREENS.REPORT,
                                            params: {reportID: '1'},
                                        },
                                    ],
                                },
                            },
                        ],
                    }}
                />,
            );

            const rootStateBeforeSwitch = navigationRef.current?.getRootState();
            expect(rootStateBeforeSwitch?.index).toBe(0);
            const lastRouteBeforeSwitch = rootStateBeforeSwitch?.routes?.at(-1);
            expect(lastRouteBeforeSwitch?.name).toBe(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
            expect(lastRouteBeforeSwitch?.params).toBeUndefined();

            // When switch to the specific policy from the Inbox tab
            act(() => {
                switchPolicyAfterInteractions('1');
            });

            // Then push a new report split navigator with the policyID route param
            const rootStateAfterSwitch = navigationRef.current?.getRootState();
            expect(rootStateAfterSwitch?.index).toBe(1);
            const lastRouteAfterSwitch = rootStateAfterSwitch?.routes?.at(-1);
            expect(lastRouteAfterSwitch?.name).toBe(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
            expect(lastRouteAfterSwitch?.params).toMatchObject({policyID: '1'});
        });

        it('from the Search page', () => {
            // Given the initialized navigation on the narrow layout with the search page without the active workspace
            render(
                <TestNavigationContainer
                    initialState={{
                        index: 0,
                        routes: [
                            {
                                name: SCREENS.SEARCH.ROOT,
                                params: {
                                    q: 'type:expense status:all sortBy:date sortOrder:desc',
                                },
                            },
                        ],
                    }}
                />,
            );

            const rootStateBeforeSwitch = navigationRef.current?.getRootState();
            expect(rootStateBeforeSwitch?.index).toBe(0);
            const lastRouteBeforeSwitch = rootStateBeforeSwitch?.routes?.at(-1);
            expect(lastRouteBeforeSwitch?.name).toBe(SCREENS.SEARCH.ROOT);
            expect(lastRouteBeforeSwitch?.params).toMatchObject({q: 'type:expense status:all sortBy:date sortOrder:desc'});

            // When switch to the specific policy from the Search page
            act(() => {
                switchPolicyAfterInteractions('1');
            });

            // Then push a new search page with the policyID included in the query
            const rootStateAfterSwitch = navigationRef.current?.getRootState();
            expect(rootStateAfterSwitch?.index).toBe(1);
            const lastRouteAfterSwitch = rootStateAfterSwitch?.routes?.at(-1);
            expect(lastRouteAfterSwitch?.name).toBe(SCREENS.SEARCH.ROOT);
            expect(lastRouteAfterSwitch?.params).toMatchObject({q: 'type:expense status:all sortBy:date sortOrder:desc policyID:1'});
        });
    });

    describe('from the specific workspace to the global', () => {
        it('from the Inbox tab', () => {
            // Given the initialized navigation on the narrow layout with the reports split navigator without the active workspace
            render(
                <TestNavigationContainer
                    initialState={{
                        index: 0,
                        routes: [
                            {
                                name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                                params: {policyID: '1'},
                                state: {
                                    index: 1,
                                    routes: [
                                        {
                                            name: SCREENS.HOME,
                                        },
                                        {
                                            name: SCREENS.REPORT,
                                            params: {reportID: '1'},
                                        },
                                    ],
                                },
                            },
                        ],
                    }}
                />,
            );

            const rootStateBeforeSwitch = navigationRef.current?.getRootState();
            expect(rootStateBeforeSwitch?.index).toBe(0);
            const lastRouteBeforeSwitch = rootStateBeforeSwitch?.routes?.at(-1);
            expect(lastRouteBeforeSwitch?.name).toBe(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
            expect(lastRouteBeforeSwitch?.params).toMatchObject({policyID: '1'});

            // When switch policy to the global from the Inbox tab
            act(() => {
                switchPolicyAfterInteractions(undefined);
            });

            // Then push a new report split navigator without the policyID route param
            const rootStateAfterSwitch = navigationRef.current?.getRootState();
            expect(rootStateAfterSwitch?.index).toBe(1);
            const lastRouteAfterSwitch = rootStateAfterSwitch?.routes?.at(-1);
            expect(lastRouteAfterSwitch?.name).toBe(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
            expect(lastRouteAfterSwitch?.params).toMatchObject({policyID: undefined});
        });

        it('from the Search page', () => {
            // Given the initialized navigation on the narrow layout with the search page without the active workspace
            render(
                <TestNavigationContainer
                    initialState={{
                        index: 0,
                        routes: [
                            {
                                name: SCREENS.SEARCH.ROOT,
                                params: {
                                    q: 'type:expense status:all sortBy:date sortOrder:desc policyID:1',
                                },
                            },
                        ],
                    }}
                />,
            );

            const rootStateBeforeSwitch = navigationRef.current?.getRootState();
            expect(rootStateBeforeSwitch?.index).toBe(0);
            const lastRouteBeforeSwitch = rootStateBeforeSwitch?.routes?.at(-1);
            expect(lastRouteBeforeSwitch?.name).toBe(SCREENS.SEARCH.ROOT);
            expect(lastRouteBeforeSwitch?.params).toMatchObject({q: 'type:expense status:all sortBy:date sortOrder:desc policyID:1'});

            // When switch policy to the global from the Search page
            act(() => {
                switchPolicyAfterInteractions(undefined);
            });

            // Then push a new search page without the policyID included in the query
            const rootStateAfterSwitch = navigationRef.current?.getRootState();
            expect(rootStateAfterSwitch?.index).toBe(1);
            const lastRouteAfterSwitch = rootStateAfterSwitch?.routes?.at(-1);
            expect(lastRouteAfterSwitch?.name).toBe(SCREENS.SEARCH.ROOT);
            expect(lastRouteAfterSwitch?.params).toMatchObject({q: 'type:expense status:all sortBy:date sortOrder:desc'});
        });
    });
});
