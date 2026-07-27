import {act, render} from '@testing-library/react-native';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import React from 'react';

import TestNavigationContainer from '../utils/TestNavigationContainer';

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@libs/getIsNarrowLayout', () => jest.fn());

jest.mock('@pages/inbox/sidebar/NavigationTabBarAvatar');

const mockedGetIsNarrowLayout = jest.mocked(getIsNarrowLayout);
const mockedUseResponsiveLayout = jest.mocked(useResponsiveLayout);

const SELF_DM_REPORT_ID = '111';
const EXPENSE_THREAD_REPORT_ID = '222';
const TRANSACTION_ID = '333';

/**
 * Renders the state the app is in at step 7 of https://github.com/Expensify/App/issues/96796: the user drilled from
 * the self DM into the tracked expense thread, opened its details and started "Submit to my employer", so the
 * confirmation RHP sits on top of the expense thread while the self DM is still underneath in the split navigator.
 */
function renderConfirmationOverExpenseThread() {
    render(
        <TestNavigationContainer
            initialState={{
                index: 1,
                routes: [
                    {
                        name: NAVIGATORS.TAB_NAVIGATOR,
                        state: {
                            index: 1,
                            routes: [
                                {name: SCREENS.HOME},
                                {
                                    name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                                    state: {
                                        index: 2,
                                        routes: [
                                            {name: SCREENS.INBOX},
                                            {name: SCREENS.REPORT, params: {reportID: SELF_DM_REPORT_ID}},
                                            {name: SCREENS.REPORT, params: {reportID: EXPENSE_THREAD_REPORT_ID}},
                                        ],
                                    },
                                },
                                {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR},
                                {name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR},
                                {name: NAVIGATORS.WORKSPACE_NAVIGATOR},
                            ],
                        },
                    },
                    {
                        name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
                        state: {
                            index: 0,
                            routes: [
                                {
                                    name: SCREENS.RIGHT_MODAL.MONEY_REQUEST,
                                    state: {
                                        index: 0,
                                        routes: [
                                            {
                                                name: SCREENS.MONEY_REQUEST.STEP_CONFIRMATION,
                                                params: {
                                                    action: CONST.IOU.ACTION.SUBMIT,
                                                    iouType: CONST.IOU.TYPE.SUBMIT,
                                                    transactionID: TRANSACTION_ID,
                                                    reportID: EXPENSE_THREAD_REPORT_ID,
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            }}
        />,
    );
}

/** Same confirmation RHP, but reached while the Search tab is the active tab rather than a report. */
function renderConfirmationOverSearch() {
    render(
        <TestNavigationContainer
            initialState={{
                index: 1,
                routes: [
                    {
                        name: NAVIGATORS.TAB_NAVIGATOR,
                        state: {
                            index: 2,
                            routes: [
                                {name: SCREENS.HOME},
                                {
                                    name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                                    state: {
                                        index: 1,
                                        routes: [{name: SCREENS.INBOX}, {name: SCREENS.REPORT, params: {reportID: SELF_DM_REPORT_ID}}],
                                    },
                                },
                                {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR},
                                {name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR},
                                {name: NAVIGATORS.WORKSPACE_NAVIGATOR},
                            ],
                        },
                    },
                    {
                        name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
                        state: {
                            index: 0,
                            routes: [{name: SCREENS.RIGHT_MODAL.MONEY_REQUEST}],
                        },
                    },
                ],
            }}
        />,
    );
}

function getCentralPaneReportID() {
    const tabState = navigationRef.current?.getRootState().routes.at(0)?.state;
    const reportsSplitNavigator = tabState?.routes.at(1);
    const topmostReport = reportsSplitNavigator?.state?.routes.findLast((route) => route.name === SCREENS.REPORT);
    return (topmostReport?.params as {reportID?: string} | undefined)?.reportID;
}

describe('Going back from the submit confirmation page opened over an expense thread', () => {
    beforeEach(() => {
        mockedGetIsNarrowLayout.mockReturnValue(false);
        mockedUseResponsiveLayout.mockReturnValue({
            ...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE,
            shouldUseNarrowLayout: false,
            isSmallScreenWidth: false,
            isLargeScreenWidth: true,
        });
    });

    it('swaps the central pane to the origin report when backTo points at a report the user is not on', () => {
        // Given the confirmation RHP opened over the expense thread
        renderConfirmationOverExpenseThread();
        expect(getCentralPaneReportID()).toBe(EXPENSE_THREAD_REPORT_ID);

        // When going back to the self DM the flow originated from
        act(() => {
            Navigation.goBack(ROUTES.REPORT_WITH_ID.getRoute(SELF_DM_REPORT_ID));
        });

        // Then the RHP closes but the central pane is swapped to the self DM
        const rootState = navigationRef.current?.getRootState();
        expect(rootState?.routes.at(-1)?.name).not.toBe(NAVIGATORS.RIGHT_MODAL_NAVIGATOR);
        expect(getCentralPaneReportID()).toBe(SELF_DM_REPORT_ID);
    });

    it('resolves the visible report behind the RHP, which is what the flow uses to build backTo', () => {
        // Given the confirmation RHP opened over the expense thread
        renderConfirmationOverExpenseThread();

        // Then the report behind the RHP is resolvable even though an RHP is focused
        expect(isReportTopmostSplitNavigator()).toBe(true);
        expect(Navigation.getTopmostReportId()).toBe(EXPENSE_THREAD_REPORT_ID);
    });

    it('reports no visible report when the flow is started from another tab', () => {
        // Given an RHP opened while the Search tab is the active tab
        renderConfirmationOverSearch();

        // Then the flow falls back to the report the expense lives on instead of a stale inbox report
        expect(isReportTopmostSplitNavigator()).toBe(false);
    });

    it('leaves the central pane alone when backTo points at the report the user is on', () => {
        // Given the confirmation RHP opened over the expense thread
        renderConfirmationOverExpenseThread();

        // When going back to the report that is actually displayed
        act(() => {
            Navigation.goBack(ROUTES.REPORT_WITH_ID.getRoute(EXPENSE_THREAD_REPORT_ID));
        });

        // Then the RHP closes and the expense thread stays open
        const rootState = navigationRef.current?.getRootState();
        expect(rootState?.routes.at(-1)?.name).not.toBe(NAVIGATORS.RIGHT_MODAL_NAVIGATOR);
        expect(getCentralPaneReportID()).toBe(EXPENSE_THREAD_REPORT_ID);
    });
});
