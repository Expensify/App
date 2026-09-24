import {fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import InsightsGroupByDropdown from '@pages/Insights/controls/InsightsGroupByDropdown';
import InsightsGroupCurrencyControl from '@pages/Insights/controls/InsightsGroupCurrencyControl';
import InsightsPageControls from '@pages/Insights/controls/InsightsPageControls';
import InsightsWorkspaceControl from '@pages/Insights/controls/InsightsWorkspaceControl';
import type {InsightsFilters} from '@pages/Insights/insightsFilters';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';

import type {ReactNode} from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import Onyx from 'react-native-onyx';

import currencyList from '../unit/currencyList.json';
import createRandomPolicy from '../utils/collections/policies';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation');

const POLICY_ID = 'A1';
const POLICY_NAME = 'Marketing';

const RESET = /^(Reset|common\.reset)$/;
const APPLY = /^(Apply|common\.apply)$/;

const FILTERS: InsightsFilters = {
    date: {preset: CONST.SEARCH.DATE_PRESETS.LAST_MONTH},
    policyIDs: [POLICY_ID],
    groupBy: CONST.SEARCH.GROUP_BY.MONTH,
    groupCurrency: 'USD',
};

const Stack = createStackNavigator();

function renderWithProviders(children: ReactNode) {
    return render(
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name={SCREENS.INSIGHTS}>
                    {() => <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider]}>{children}</ComposeProviders>}
                </Stack.Screen>
            </Stack.Navigator>
        </NavigationContainer>,
    );
}

async function openPill(label: RegExp) {
    fireEvent.press(screen.getByText(label));
    await waitForBatchedUpdatesWithAct();
}

describe('Insights controls', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(async () => {
        const policy: Policy = {...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM), id: POLICY_ID, name: POLICY_NAME};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await Onyx.set(ONYXKEYS.CURRENCY_LIST, currencyList);
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await Onyx.clear();
        jest.clearAllMocks();
    });

    it('shows the page-level filters the dashboard is narrowed by', async () => {
        // Given a dashboard on last month, one workspace and USD
        renderWithProviders(
            <InsightsPageControls
                filters={FILTERS}
                defaultFilters={{...FILTERS, policyIDs: [], groupCurrency: 'PLN'}}
                onChange={jest.fn()}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        // Then each pill shows the selection it owns, so the user sees what the charts are narrowed by
        expect(screen.getByText(/Date: /)).toBeOnTheScreen();
        expect(screen.getByText(new RegExp(`: ${POLICY_NAME}$`))).toBeOnTheScreen();
        expect(screen.getByText(/: USD$/)).toBeOnTheScreen();
    });

    it('resets Group currency to the default workspace currency rather than the current one', async () => {
        // Given a dashboard stored in USD for a user whose default workspace reports in PLN
        const onChange = jest.fn();
        renderWithProviders(
            <InsightsGroupCurrencyControl
                value="USD"
                defaultValue="PLN"
                onChange={onChange}
            />,
        );

        // When the user opens the control and resets it
        await openPill(/: USD$/);
        fireEvent.press(screen.getByText(RESET));
        await waitForBatchedUpdatesWithAct();

        // Then the dashboard goes back to the currency it starts from
        expect(onChange).toHaveBeenCalledWith('PLN');
    });

    it('applies the grouping the user picks', async () => {
        // Given the headline chart grouped by month
        const onChange = jest.fn();
        renderWithProviders(
            <InsightsGroupByDropdown
                groupBy={CONST.SEARCH.GROUP_BY.MONTH}
                onChange={onChange}
            />,
        );

        // When the user picks Quarter and applies it
        await openPill(/: Month$/);
        fireEvent.press(screen.getByText(/^(Quarter|search\.filters\.groupBy\.quarter)$/));
        fireEvent.press(screen.getByText(APPLY));
        await waitForBatchedUpdatesWithAct();

        // Then the chart is asked to regroup by quarter
        expect(onChange).toHaveBeenCalledWith(CONST.SEARCH.GROUP_BY.QUARTER);
    });

    it('resets the grouping to month', async () => {
        // Given the headline chart grouped by quarter
        const onChange = jest.fn();
        renderWithProviders(
            <InsightsGroupByDropdown
                groupBy={CONST.SEARCH.GROUP_BY.QUARTER}
                onChange={onChange}
            />,
        );

        // When the user resets the control
        await openPill(/: Quarter$/);
        fireEvent.press(screen.getByText(RESET));
        await waitForBatchedUpdatesWithAct();

        // Then the chart goes back to the default monthly buckets
        expect(onChange).toHaveBeenCalledWith(CONST.SEARCH.GROUP_BY.MONTH);
    });

    it('resets Workspace to every workspace', async () => {
        // Given a dashboard narrowed to one workspace
        const onChange = jest.fn();
        renderWithProviders(
            <InsightsWorkspaceControl
                value={[POLICY_ID]}
                onChange={onChange}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        // When the user resets the control
        await openPill(new RegExp(`: ${POLICY_NAME}$`));
        fireEvent.press(screen.getByText(RESET));
        await waitForBatchedUpdatesWithAct();

        // Then no workspace is selected, which reports on all of them
        expect(onChange).toHaveBeenCalledWith([]);
    });
});
