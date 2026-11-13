import {render} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import SearchChartView from '@components/Search/SearchChartView';
import type {GroupedItem} from '@components/Search/types';
import WidgetHeaderMenu from '@components/WidgetHeaderMenu';

import localFileDownload from '@libs/localFileDownload';
import Navigation from '@libs/Navigation/Navigation';
import {INSIGHTS_CHART_STATE} from '@libs/resolveInsightsChartData';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import InsightsExplainButton from '@pages/Insights/ai/InsightsExplainButton';
import InsightsChartWidget from '@pages/Insights/charts/InsightsChartWidget';
import type {InsightsChartWidgetProps} from '@pages/Insights/charts/InsightsChartWidget';
import InsightsViolationStageControl from '@pages/Insights/controls/InsightsViolationStageControl';
import INSIGHTS_DASHBOARD_SPECS from '@pages/Insights/dashboardSpecs';
import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import buildInsightsJsonQuery from '@pages/Insights/insightsQueries';
import useInsightsChartData from '@pages/Insights/useInsightsChartData';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React from 'react';
import Onyx from 'react-native-onyx';

import currencyList from '../unit/currencyList.json';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/WidgetHeaderMenu', () => jest.fn(() => null));
jest.mock('@components/Search/SearchChartView', () => jest.fn(() => null));
jest.mock('@libs/localFileDownload', () => jest.fn());
jest.mock('@libs/Navigation/Navigation');
jest.mock('@pages/Insights/useInsightsChartData', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@pages/Insights/ai/InsightsExplainButton', () => jest.fn(() => null));
jest.mock('@pages/Insights/controls/InsightsViolationStageControl', () => jest.fn(() => null));

const CHART = INSIGHTS_DASHBOARD_SPECS[CONST.INSIGHTS.DASHBOARD.SPEND].headlineChart;
const QUERY = buildSearchQueryJSON('type:expense group-by:month date>=2026-01-01 date<=2026-03-31 group-currency:USD');
const FILTERS: InsightsFilters = {date: {from: '2026-01-01', to: '2026-03-31'}, policyIDs: [], groupBy: CONST.SEARCH.GROUP_BY.MONTH, groupCurrency: CONST.CURRENCY.USD};
const FEBRUARY: GroupedItem = {
    groupedBy: CONST.SEARCH.GROUP_BY.MONTH,
    year: 2026,
    month: 2,
    keyForList: 'group_february',
    count: 2,
    total: 12345,
    currency: CONST.CURRENCY.USD,
    transactions: [],
    formattedMonth: 'February 2026',
    shortFormattedMonth: 'Feb',
    sortKey: 202602,
};
const DATA: GroupedItem[] = [FEBRUARY];

function renderWidget({
    dashboardID = CONST.INSIGHTS.DASHBOARD.SPEND,
    supportsDrillIn,
    chart = CHART,
    queryJSON = QUERY,
    onViolationStageChange,
    insightsScope = {searchKey: INSIGHTS_DASHBOARD_SPECS[dashboardID].searchKey, policyIDs: [], date: FILTERS.date, groupCurrency: FILTERS.groupCurrency},
}: Partial<Pick<InsightsChartWidgetProps, 'dashboardID' | 'supportsDrillIn' | 'chart' | 'queryJSON' | 'onViolationStageChange' | 'insightsScope'>> = {}) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider]}>
            <InsightsChartWidget
                dashboardID={dashboardID}
                chart={chart}
                queryJSON={queryJSON}
                snapshot={undefined}
                previousPeriodQueryJSON={undefined}
                previousPeriodSnapshot={undefined}
                average={undefined}
                isDashboardLoaded={undefined}
                filters={FILTERS}
                insightsScope={insightsScope}
                supportsDrillIn={supportsDrillIn}
                onRetry={jest.fn()}
                onViolationStageChange={onViolationStageChange}
            />
        </ComposeProviders>,
    );
}

describe('Insights chart CSV action', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.set(ONYXKEYS.CURRENCY_LIST, currencyList);
        await waitForBatchedUpdatesWithAct();
        jest.mocked(useInsightsChartData).mockReturnValue({data: DATA, state: INSIGHTS_CHART_STATE.READY, comparison: undefined});
    });

    afterEach(() => Onyx.clear());

    it('offers a local CSV below View on Spend and exports only the current period', async () => {
        // Given a ready chart compared against a different set of totals
        jest.mocked(useInsightsChartData).mockReturnValue({
            data: DATA,
            state: INSIGHTS_CHART_STATE.READY,
            comparison: {data: DATA.map((item) => ({...item, total: 99999})), color: '#000000'},
        });

        // When the user selects Download CSV
        renderWidget();
        await waitForBatchedUpdatesWithAct();
        const menuItems = jest.mocked(WidgetHeaderMenu).mock.lastCall?.[0].menuItems;
        expect(menuItems?.map((item) => item.text)).toEqual(['View on Spend', 'Download CSV']);
        menuItems?.at(1)?.onSelected?.();

        // Then the existing local download helper receives only the grouped current-period values
        expect(localFileDownload).toHaveBeenCalledWith(`Expensify-${CHART.graphKey}.csv`, '\uFEFFDate,Expenses,Total,Currency\r\n2026-02-01,2,123.45,USD', expect.any(Function));
    });

    it.each([INSIGHTS_CHART_STATE.LOADING, INSIGHTS_CHART_STATE.EMPTY, INSIGHTS_CHART_STATE.ERROR, INSIGHTS_CHART_STATE.OFFLINE])(
        'hides Download CSV while the chart is %s',
        async (state) => {
            // Given chart data that is not ready to export
            jest.mocked(useInsightsChartData).mockReturnValue({data: [], state, comparison: undefined});

            // When its header is rendered
            renderWidget();
            await waitForBatchedUpdatesWithAct();
            const menuItems = jest.mocked(WidgetHeaderMenu).mock.lastCall?.[0].menuItems ?? [];

            // Then no stale or incomplete data can be downloaded, while View on Spend remains available during loading
            expect(menuItems.map((item) => item.text)).toEqual(state === INSIGHTS_CHART_STATE.LOADING ? ['View on Spend'] : []);
            expect(localFileDownload).not.toHaveBeenCalled();
        },
    );

    it('offers only the CSV and keeps points from being pressed on a dashboard without drill-in', async () => {
        // Given a ready chart on a dashboard whose reports have no view on Spend
        // When it renders
        renderWidget({supportsDrillIn: false});
        await waitForBatchedUpdatesWithAct();

        // Then its menu can still download the data, but neither the menu nor a pressed point can open Spend
        expect(jest.mocked(WidgetHeaderMenu).mock.lastCall?.[0].menuItems.map((item) => item.text)).toEqual(['Download CSV']);
        expect(jest.mocked(SearchChartView).mock.lastCall?.[0]).toMatchObject({shouldDrillDownOnPress: false});
    });
});

describe('Insights chart press', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.set(ONYXKEYS.CURRENCY_LIST, currencyList);
        await waitForBatchedUpdatesWithAct();
        jest.mocked(useInsightsChartData).mockReturnValue({data: DATA, state: INSIGHTS_CHART_STATE.READY, comparison: undefined});
    });

    afterEach(() => Onyx.clear());

    it.each([INSIGHTS_CHART_STATE.READY, INSIGHTS_CHART_STATE.EMPTY, INSIGHTS_CHART_STATE.OFFLINE])('keeps the selected stage reachable while the chart is %s', async (state) => {
        // Given a Compliance chart displaying approval violations, even when the stage has no usable data
        const spec = INSIGHTS_DASHBOARD_SPECS[CONST.INSIGHTS.DASHBOARD.COMPLIANCE];
        const request = buildInsightsJsonQuery(CONST.INSIGHTS.DASHBOARD.COMPLIANCE, FILTERS, spec.supportingCharts, {violationsOverTime: 'approved', topViolations: 'submitted'});
        jest.mocked(useInsightsChartData).mockReturnValue({data: [], state, comparison: undefined});
        const onViolationStageChange = jest.fn();

        // When the widget renders
        renderWidget({dashboardID: CONST.INSIGHTS.DASHBOARD.COMPLIANCE, chart: request?.headlineChart.chart, queryJSON: request?.headlineChart.queryJSON, onViolationStageChange});
        await waitForBatchedUpdatesWithAct();

        // Then the control keeps the approval selection and Search receives the same effective query
        expect(jest.mocked(InsightsViolationStageControl).mock.lastCall?.[0]).toMatchObject({
            graphKey: CONST.INSIGHTS.GRAPH.VIOLATIONS_OVER_TIME,
            value: 'approved',
            onChange: onViolationStageChange,
        });
        if (state === INSIGHTS_CHART_STATE.READY) {
            expect(jest.mocked(SearchChartView).mock.lastCall?.[0].queryJSON).toBe(request?.headlineChart.queryJSON);
        }
    });

    it('keeps action-date grouping when opening a Compliance chart on Spend', async () => {
        // Given a Compliance chart of approval actions, not expense creation dates
        const spec = INSIGHTS_DASHBOARD_SPECS[CONST.INSIGHTS.DASHBOARD.COMPLIANCE];
        const request = buildInsightsJsonQuery(CONST.INSIGHTS.DASHBOARD.COMPLIANCE, FILTERS, spec.supportingCharts, {violationsOverTime: 'approved', topViolations: 'submitted'});
        renderWidget({dashboardID: CONST.INSIGHTS.DASHBOARD.COMPLIANCE, chart: request?.headlineChart.chart, queryJSON: request?.headlineChart.queryJSON});
        await waitForBatchedUpdatesWithAct();

        // When View on Spend is selected
        jest.mocked(WidgetHeaderMenu).mock.lastCall?.[0].menuItems.at(0)?.onSelected?.();
        const route = jest.mocked(Navigation.navigate).mock.lastCall?.[0];

        // Then Spend uses the same stage, period and grouping as the chart
        expect(route).toEqual(expect.stringContaining(encodeURIComponent('has:approved-violation')));
        expect(route).toEqual(expect.stringContaining('anyApproval'));
        expect(route).toEqual(expect.stringContaining(encodeURIComponent('groupBy:month')));
    });

    it('explains only the chart stage without changing the combined card scope', async () => {
        // Given shared dashboard scope used by the AI cards and an approval chart
        await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.INSIGHTS_AI]);
        const insightsScope = {searchKey: CONST.INSIGHTS.SEARCH_KEY.COMPLIANCE, policyIDs: [], date: FILTERS.date, groupCurrency: FILTERS.groupCurrency};
        const chart = {...INSIGHTS_DASHBOARD_SPECS[CONST.INSIGHTS.DASHBOARD.COMPLIANCE].headlineChart, violationStage: CONST.INSIGHTS.VIOLATION_STAGE.APPROVED};

        // When its Explain button is rendered
        renderWidget({dashboardID: CONST.INSIGHTS.DASHBOARD.COMPLIANCE, chart, insightsScope});
        await waitForBatchedUpdatesWithAct();

        // Then Explain is stage-scoped, while cards keep their original combined scope
        expect(jest.mocked(InsightsExplainButton).mock.lastCall?.[0].insightsScope).toEqual({...insightsScope, violationStage: 'approved'});
        expect(insightsScope).not.toHaveProperty('violationStage');
    });

    it('opens the Details panel for the pressed period on the Spend dashboard', async () => {
        // Given a Spend chart plotting February, for a user on the beta the panel ships behind
        await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.INSIGHTS_AI]);
        renderWidget();
        await waitForBatchedUpdatesWithAct();

        // When the user presses the February point
        jest.mocked(SearchChartView).mock.lastCall?.[0].onGroupPress?.(FEBRUARY);

        // Then the panel opens for February, named by its first and last day, instead of jumping to the Spend page
        expect(Navigation.navigate).toHaveBeenCalledWith(
            ROUTES.INSIGHTS_DETAILS.getRoute({dashboardID: CONST.INSIGHTS.DASHBOARD.SPEND, graphKey: CHART.graphKey, itemKey: '2026-02-01', periodEnd: '2026-02-28'}),
        );
    });

    it('keeps the default press without the Insights AI beta', async () => {
        // Given a Spend chart for a user without the beta the panel ships behind
        await Onyx.set(ONYXKEYS.BETAS, []);
        renderWidget();
        await waitForBatchedUpdatesWithAct();

        // Then the chart gets no press override, so a press still opens Search filtered to the point
        expect(jest.mocked(SearchChartView).mock.lastCall?.[0].onGroupPress).toBeUndefined();
    });

    it('keeps the default press on dashboards without a Details panel', async () => {
        // Given a chart on the Compliance dashboard, which has no Details panel
        await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.INSIGHTS_AI]);
        renderWidget({dashboardID: CONST.INSIGHTS.DASHBOARD.COMPLIANCE});
        await waitForBatchedUpdatesWithAct();

        // Then the chart gets no press override, so a press still opens Search filtered to the point
        expect(jest.mocked(SearchChartView).mock.lastCall?.[0].onGroupPress).toBeUndefined();
    });
});
